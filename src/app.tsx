import './base.scss';
// import { createRoot } from 'react-dom/client';
import { useCallback, useEffect, useRef, useState } from 'react';

function App() {
  const [time, setTime] = useState(0);
  const [tagList, setTagList] = useState<any[]>();

  useEffect(() => {
    const li = 'zzzzzzzzzzz';
    const tags: JSX.Element[] = [];
    for (let i = 0; i < 1000; i++) {
      tags.push(<div key={i}>{li}</div>);
    }
    setTagList(tags);
  }, []);

  return (
    <div className='app'>
      输入:{time}
      <img width={100} height={100} src={'./test.jpg'} alt='' />
      <button onClick={() => setTime(Date.now())}>click</button>
      {tagList}
    </div>
  );
}

export default App;
