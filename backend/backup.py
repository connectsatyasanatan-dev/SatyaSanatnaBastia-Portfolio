#!/usr/bin/env python3
"""
backup.py - Database Backup & Restore Utility for PostgreSQL Portfolio DB

Usage:
  # Create a timestamped backup JSON in backend/backups/
  python backup.py --export

  # List existing backups
  python backup.py --list

  # Restore from a backup file
  python backup.py --restore backups/backup_20261017_223000.json
"""

import sys
import os
import json
import argparse
from datetime import datetime
from dotenv import load_dotenv

# Ensure backend root is in sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
load_dotenv()

from models.database import get_connection, _cursor

TABLES = [
    "personal_info",
    "skills",
    "projects",
    "experience",
    "education",
    "certifications",
    "achievements",
    "testimonials",
    "blog_posts",
    "contact_messages",
]

BACKUP_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "backups")


def export_backup() -> str:
    """Export all database tables to a structured JSON file."""
    os.makedirs(BACKUP_DIR, exist_ok=True)
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filepath = os.path.join(BACKUP_DIR, f"portfolio_backup_{timestamp}.json")

    conn = get_connection()
    cur = _cursor(conn)
    backup_data = {
        "version": "1.0",
        "timestamp": datetime.now().isoformat(),
        "tables": {},
    }

    try:
        total_rows = 0
        for table in TABLES:
            cur.execute(f"SELECT * FROM {table}")
            rows = cur.fetchall()
            # Convert datetime/unserializable fields to string
            serializable_rows = []
            for row in rows:
                r_dict = dict(row)
                for k, v in r_dict.items():
                    if isinstance(v, datetime):
                        r_dict[k] = v.isoformat()
                serializable_rows.append(r_dict)
            backup_data["tables"][table] = serializable_rows
            total_rows += len(serializable_rows)
            print(f"  [+] {table}: {len(serializable_rows)} rows exported")

        with open(filepath, "w", encoding="utf-8") as f:
            json.dump(backup_data, f, indent=2, ensure_ascii=False)

        print(f"\n[SUCCESS] Backup saved to: {filepath} ({total_rows} total rows)")
        return filepath
    finally:
        cur.close()
        conn.close()


def list_backups():
    """List all available backup files."""
    if not os.path.exists(BACKUP_DIR):
        print("No backups directory found.")
        return

    files = sorted(
        [f for f in os.listdir(BACKUP_DIR) if f.endswith(".json")],
        reverse=True,
    )
    if not files:
        print("No backup files found in:", BACKUP_DIR)
        return

    print(f"Available Backups ({len(files)} found in {BACKUP_DIR}):")
    for f in files:
        path = os.path.join(BACKUP_DIR, f)
        size_kb = os.path.getsize(path) / 1024
        mtime = datetime.fromtimestamp(os.path.getmtime(path)).strftime("%Y-%m-%d %H:%M:%S")
        print(f"  * {f} ({size_kb:.1f} KB, modified: {mtime})")


def restore_backup(filepath: str) -> bool:
    """Restore database from a backup JSON file."""
    if not os.path.exists(filepath):
        print(f"[ERROR] Backup file not found: {filepath}")
        return False

    with open(filepath, "r", encoding="utf-8") as f:
        data = json.load(f)

    tables_data = data.get("tables", {})
    if not tables_data:
        print("[ERROR] Invalid backup format: missing 'tables' key.")
        return False

    conn = get_connection()
    cur = conn.cursor()

    try:
        print(f"Restoring backup from {filepath} (timestamp: {data.get('timestamp')})...")
        for table, rows in tables_data.items():
            if table not in TABLES:
                continue

            # Clear current table
            cur.execute(f"DELETE FROM {table}")

            if not rows:
                print(f"  [+] {table}: 0 rows (table emptied)")
                continue

            # Insert rows
            for row in rows:
                cols = list(row.keys())
                vals = [row[c] for c in cols]
                cols_str = ", ".join(cols)
                placeholders = ", ".join(["%s"] * len(cols))
                query = f"INSERT INTO {table} ({cols_str}) VALUES ({placeholders})"
                cur.execute(query, tuple(vals))

            # Reset serial auto-increment sequences if id exists
            cur.execute(
                f"SELECT setval(pg_get_serial_sequence('{table}', 'id'), COALESCE(MAX(id), 1)) FROM {table};"
            )
            print(f"  [+] {table}: {len(rows)} rows restored")

        conn.commit()
        print("\n[SUCCESS] All tables restored successfully!")
        return True
    except Exception as e:
        conn.rollback()
        print(f"\n[ERROR] Restore failed: {e}")
        return False
    finally:
        cur.close()
        conn.close()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Portfolio Database Backup & Restore CLI")
    parser.add_argument("--export", action="store_true", help="Create a new JSON backup")
    parser.add_argument("--list", action="store_true", help="List all available backups")
    parser.add_argument("--restore", type=str, help="Path to backup JSON file to restore")

    args = parser.parse_args()

    if args.export:
        export_backup()
    elif args.list:
        list_backups()
    elif args.restore:
        restore_backup(args.restore)
    else:
        # Default action: create export
        export_backup()
