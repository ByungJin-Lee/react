import { 
  ToggleButton, 
  ToggleButtonGroup 
} from "@mui/material";

import React, { 
  useState, 
  useEffect,
  useRef
} from "react";

import {
  generateDumbBoardItems,
  getScrollDispatcher,
  debounce
} from "./tools";

function useTimer(
  waitSecond : number,
  callbackAwake : () => void,
  callbackOver : () => void,
  callbackTick : (count: number) => void,
) {
  
  const timerRef = useRef({
    sec: 0,
    awake: false
  });

  const reset = ()=> {
    timerRef.current.sec = 0;
    if(!timerRef.current.awake){
      timerRef.current.awake = true;
      callbackAwake();
    }
  }

  useEffect(() =>{
    reset();

    const runner = setInterval(()=>{
      if(timerRef.current.awake){
        timerRef.current.sec++;
        callbackTick(timerRef.current.sec);
        if(timerRef.current.sec >= waitSecond){
          timerRef.current.awake = false;
          callbackOver();
        }
      }
    }, 1000);

    return ()=>clearInterval(runner);
  }, []);

  return [reset];
}

function useWindowEvent(
  evtTypes : string[], 
  callback : (e : any) => void
) {

  useEffect(()=> {
    const listener = (e : any) => {
      callback(e);
    }

    evtTypes.forEach(eType => {
      window.addEventListener(eType, listener);
    });
    
    return ()=>{
      evtTypes.forEach(eType => {
        window.removeEventListener(eType, listener);
      });
    }
  }, [])
}




//#region 'useInfiniteScroll'


function useInfiniteScroll(
  sensitive: number,
) {

  const blockRef = useRef({blocked: false});
  const [page, setPage] = useState(1);

  const isBlocked = () => {
    return blockRef.current.blocked;
  }

  const block = () => {
    blockRef.current.blocked = true;
  }

  const unblock = () => {
    blockRef.current.blocked = false;
  }

  /**
   * Call callback when page's value is updated.
   */
  
  useEffect(() => {

    const [installEvent, uninstallEvent] = 
      getScrollDispatcher(sensitive, ()=>{
        if(!isBlocked()){
          setPage(p=>p+1);
          block();
        }
      });

    installEvent();

    return ()=>uninstallEvent();

  }, []);

  return [page, unblock] as [number, ()=>void];
}
//#endregion 'useInfiniteScroll'

//#region 'useToggleButtonGroup'
function useToggleButtonGroup(
  pairs: {
    [key: string]: string
  }
) {

  const keys = Object.keys(pairs)

  const [selected, setSelected] = useState(keys[0]);

  const handleChange = (evt: any, newSelected: React.SetStateAction<string>) => {
    setSelected(newSelected);
  }

  const Component = () => (
    <ToggleButtonGroup
      color="primary"
      onChange={handleChange}
      value={selected}
      exclusive
    >
      { keys.map((key: string) => 
        <ToggleButton key={key} value={key}>{pairs[key]}</ToggleButton>) 
      }
    </ToggleButtonGroup>
  );

  return [selected, Component] as [string, ()=>JSX.Element];
}

//#endregion

export {
  useTimer,
  useWindowEvent,
  useInfiniteScroll,
  generateDumbBoardItems,
  useToggleButtonGroup
}