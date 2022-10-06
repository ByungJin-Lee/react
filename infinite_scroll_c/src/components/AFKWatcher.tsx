
import React from "react";

import { 
  useTimer,
  useWindowEvent,
} from "../lib/hooks";

import {
  debounce 
} from '../lib/tools';

interface AFKWatcherProp {
  waitSecond : number,
  callbackAwake() : void,
  callbackOver() : void,
}


const AFKWatcher : React.FC<AFKWatcherProp> = ({
  waitSecond,
  callbackAwake,
  callbackOver
}) => {

  const callbackTick = (count : number) => {
    console.log(`you are not move for ${count} seconds`);
  }

  const [reset] = useTimer(waitSecond, callbackAwake, callbackOver, callbackTick);

  useWindowEvent(
    ['mousemove', 'keydown', 'scroll'], 
    debounce(reset, 150)
  );
  
  let r = (
    <div>
    </div>
  ) 

  return r;
}

export default AFKWatcher;