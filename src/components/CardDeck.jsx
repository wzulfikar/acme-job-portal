// Adapted from react-use-gesture example at https://use-gesture.netlify.app/docs/examples.
// Codesandbox URL: https://codesandbox.io/s/fduch

import { useEffect } from 'react'
import { useKey } from 'react-use';
import { useSprings, animated, to as interpolate } from 'react-spring'
import { useDrag } from 'react-use-gesture'
import { CgEye } from 'react-icons/cg'
import { HiClipboardCheck } from 'react-icons/hi'

// These two are just helpers, they curate spring data, values that are later being interpolated into css
const to = i => ({ x: 0, y: i * -4, scale: 1, rot: -10 + Math.random() * 20, delay: i * 100 })
const from = i => ({ x: 0, rot: 0, scale: 1.5, y: -1000 })

// This is being used down there in the view, it interpolates rotation and scale into a css transform
const trans = (r, s) => `perspective(1500px) rotateX(30deg) rotateY(${r / 10}deg) rotateZ(${r}deg) scale(${s})`

function ActionBtn({ className, children, onClick = () => { } }) {
    return <button onClick={onClick} className={`flex items-center font-medium transition duration-200 ease-in-out ${className}`} > {children}</button >
}

export default function CardDeck({ cards, getControl, topCardIdx, onClickView, onChange }) {
    const [springs, set] = useSprings(cards.length, i => ({ ...to(i), from: from(i) })) // Create a bunch of springs using the helpers above

    const goneList = new Set() // The set flags all the cards that are flicked out

    useKey('ArrowLeft', swipeLeft, undefined, [topCardIdx])
    useKey('ArrowRight', swipeRight, undefined, [topCardIdx])

    // Create a gesture, we're interested in down-state, delta (current-pos - click-pos), direction and velocity
    const bind = useDrag(({ args: [cardIdx], down, movement: [mx], direction: [xDir], velocity }) => {
        const dir = xDir < 0 ? -1 : 1 // Direction should either point left or right

        const trigger = velocity > 0.2 // If you flick hard enough it should trigger the card to fly out

        if (!down && trigger) goneList.add(cardIdx) // If button/finger's up and trigger velocity is reached, we flag the card ready to fly out

        moveCard({ cardIdx, direction: dir, down, velocity, mx })
    })

    useEffect(() => {
        getControl({ resetCards })
    }, [])

    function resetCards() {
        goneList.clear();
        set(i => to(i));
    }

    function moveCard({ cardIdx, direction, mx, velocity, down }) {
        set(i => {
            // We're only interested in changing spring-data for the current spring
            if (cardIdx !== i) {
                return
            }

            const isGone = goneList.has(cardIdx)
            const x = isGone ? (200 + window.innerWidth) * direction : down ? mx : 0 // When a card is gone it flys out left or right, otherwise goes back to zero
            const rot = mx / 100 + (isGone ? direction * 10 * velocity : 0) // How much the card tilts, flicking it harder makes it rotate faster
            const scale = down ? 1.2 : 1 // Active cards lift up a bit

            if (isGone) {
                onChange(cardIdx, direction)
            }

            return { x, rot, scale, delay: undefined, config: { friction: 50, tension: down ? 800 : isGone ? 200 : 500 } }
        })
    }

    function swipeLeft() {
        console.log(`[DEBUG] swipeLeft on card #${topCardIdx}`)

        goneList.add(topCardIdx)

        moveCard({ cardIdx: topCardIdx, direction: -1, velocity: 0.1, down: true, mx: window.innerHeight * -1 })
    }

    function swipeRight() {
        console.log(`[DEBUG] swipeRight on card #${topCardIdx}`)

        goneList.add(topCardIdx)

        moveCard({ cardIdx: topCardIdx, direction: 1, velocity: 0.1, down: true, mx: 400 })
    }

    // Now we're just mapping the animated values to our view, that's it. Btw, this component only renders once. :-)
    return springs.map(({ x, y, rot, scale }, i) => (
        <animated.div key={i} style={{ transform: interpolate([x, y], (x, y) => `translate3d(${x}px, ${y}px, 0)`) }}>
            {/* This is the card itself, we're binding our gesture to it (and inject its index so we know which is which) */}
            <animated.div
                {...bind(i)}
                className="card flex items-end px-5 py-4"
                style={{ transform: interpolate([rot, scale], trans), backgroundImage: `url(${cards[i].thumbnail_url})` }} >

                {/* Action buttons at card footer*/}
                <div className="flex w-full text-sm">
                    <ActionBtn className="text-gray-100 hover:text-gray-200 h-12 w-20" onClick={() => onClickView(i)}>
                        <CgEye size={16} className="mr-1" />View
                    </ActionBtn>
                    <div className="ml-auto my-auto">
                        <ActionBtn
                            onClick={() => swipeRight()}
                            className="justify-end font-medium text-gray-100 hover:text-gray-200 h-12 w-24">Shortlist<HiClipboardCheck size={20} className="ml-1" />
                        </ActionBtn>
                    </div>
                </div>
            </animated.div>
        </animated.div >
    ))
}