import React from 'react'

const symbols = ['{ }', '< >', '/>', '(', ')', '#', '+', ':', ';', '[]', '&&', '||', '===']

const GlobalBackground = () => {
    return (
        <div className="global-bg-container" aria-hidden="true">

            {Array.from({ length: 40 }).map((_, i) => {
                const symbol = symbols[i % symbols.length]
                const isPurple = i % 3 === 0
                const isPink = i % 5 === 0
                const isDim = i % 2 === 0
                const isLarge = i % 7 === 0

                let className = 'bg-tech-symbol'
                if (isPurple) className += ' purple'
                else if (isPink) className += ' pink'
                
                if (isDim && !isLarge) className += ' dim'
                else if (isLarge) className += ' large'

                const maxOpacity = isDim ? 0.3 : isLarge ? 0.2 : 0.5
                const rotation = (i % 2 === 0 ? 1 : -1) * (i * 1.5 + 15)

                return (
                    <span 
                        key={i} 
                        className={className} 
                        style={{
                            left: `${(i * 37 + 13) % 95}%`,
                            top: `${(i * 19 + 7) % 95}%`,
                            animationDelay: `${(i * 0.43).toFixed(2)}s`,
                            animationDuration: `${12 + (i % 8) * 3}s`,
                            '--max-opacity': maxOpacity,
                            '--rot': `${rotation}deg`,
                        } as React.CSSProperties}
                    >
                        {symbol}
                    </span>
                )
            })}

        </div>
    )
}

export default GlobalBackground
