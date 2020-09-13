import { useEffect, useState, useRef } from 'react'
import { useSpring, animated } from 'react-spring'
import { FiX } from 'react-icons/fi'
import { CgSpinner } from 'react-icons/cg'
import { FaCheck } from 'react-icons/fa'
import Reward from 'react-rewards';
import useSWR from 'swr';

import CardDeck from '../src/components/CardDeck'
import Modal from '../src/components/Modal'

function HomePage() {
  const { data, error } = useSWR('listSubmissions', () => fetch('/api/submissions/list').then(res => res.json()))
  const cards = data || []

  const rewardRef = useRef()

  const [leftCount, setLeftCount] = useState(0)
  const [rightCount, setRightCount] = useState(0)

  const [cardDeckControl, setCardDeckControl] = useState(null)

  const [viewPdf, setViewPdf] = useState({ viewing: false, url: null });
  const [topCardIdx, setTopCardIdx] = useState(null)

  const [subtitleSpring, setSubtitleSpring] = useSpring(() => ({ opacity: 0 }))

  console.log("[DEBUG] topCardIdx:", topCardIdx)

  useEffect(() => {
    if (topCardIdx === null && cards.length > 0) {
      setSubtitleSpring({ opacity: 1 })
      setTopCardIdx(cards.length - 1)
    }
  }, [cards.length])

  useEffect(() => {
    if (topCardIdx < 0) {
      rewardRef.current.rewardMe()
    }
  }, [topCardIdx])

  function resetCards() {
    cardDeckControl.resetCards()

    // Reset state
    setTopCardIdx(cards.length - 1);
    setRightCount(0)
    setLeftCount(0)
  }

  function onCardChange(cardIdx, direction) {
    setTopCardIdx(cardIdx - 1)

    if (direction === 1) {
      setRightCount(rightCount + 1)
    } else {
      setLeftCount(leftCount + 1)
    }
  }

  function viewFile(url) {
    console.log("[DEBUG] viewFile:", url)

    setViewPdf({ viewing: true, url })
  }

  function onCloseView() {
    setViewPdf({ ...viewPdf, viewing: false })
  }

  if (error) {
    return <div>Could not load submissions: {error}</div>
  }

  return <>
    <div className="header shadow-md flex flex-col items-center justify-center pt-5 md:pt-10 pb-5 bg-blue-900">
      <h1 className="text-xl md:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-blue-400 to-blue-300">Acme Job Portal</h1>
      <animated.p className="text-gray-300" style={subtitleSpring}>{cards.length} new submissions</animated.p>
    </div>

    <Reward type="confetti" ref={rewardRef}>
      <div className="flex flex-col mt-10" style={{ visibility: topCardIdx !== null && topCardIdx <= 0 ? 'visible' : 'hidden' }}>
        <h1 className="flex items-center text-2xl text-blue-800 font-bold mb-5">You are all caught up <FaCheck size={24} className="ml-2 text-blue-700" /></h1>

        <div className="flex text-gray-800 font-medium px-1">Rejected: <span className="ml-auto">{leftCount}</span></div>
        <div className="flex text-gray-800 font-medium px-1">Shortlisted: <span className="ml-auto">{rightCount}</span></div>

        <button onClick={resetCards} className="shadow-md font-medium bg-gradient-to-r from-blue-500 to-blue-600 my-10 text-gray-100 py-2 px-4 rounded-md">Restart Demo</button>
      </div>
    </Reward>

    {cards
      ? <CardDeck
        cards={cards}
        topCardIdx={topCardIdx}
        onClickView={i => viewFile(cards[i].file_url)}
        onChange={onCardChange}
        getControl={control => setCardDeckControl(control)} />
      : <div>
        <CgSpinner size={30} className="animate animate-spin opacity-75" />
      </div>}

    <Modal
      animation="slideUp"
      visible={viewPdf.viewing}
      onClose={onCloseView}
      customStyles={{
        padding: 0,
        width: '100%',
        height: "100%",
        maxHeight: "95%",
        maxWidth: "95%",
      }}
      showCloseButton={false}
    >
      <div
        onClick={onCloseView}
        className="bg-gray-700 cursor-pointer flex justify-center items-center w-full text-sm text-white"
      >
        <FiX size={16} className="mr-1" /> Close Viewer
      </div>
      <iframe src={viewPdf.url} width="100%" height="100%" />
    </Modal>
  </>
}

export default HomePage;
