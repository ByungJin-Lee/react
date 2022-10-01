import { 
  ToggleButton, 
  ToggleButtonGroup 
} from "@mui/material";
import React, { 
  useState, 
  useEffect 
} from "react";

//#region 'useInfiniteScroll'

function useScrollDispatcher(sensitive, callback) {
  
  const listener = (evt) => {

    let totalHeight = document.body.clientHeight;
    let currentBottomPos = window.scrollY + window.innerHeight;

    if(totalHeight <= currentBottomPos + sensitive) {
      callback();
    }
  }

  const install = _=>{
    window.addEventListener('scroll', listener);
  }

  const uninstall = _=>{
    window.removeEventListener('scroll', listener);
  }

  return [install, uninstall];
}


function useInfiniteScroll(
  itemCountPerScroll,
  callback,
  sensitive
) {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);

  /**
   * Call callback when page's value is updated.
   */
  useEffect(() => {

    const [installEvent, uninstallEvent] = 
      useScrollDispatcher(sensitive, _=>setPage(page+1));

    installEvent();
    
    callback(items, page, itemCountPerScroll)
      .then(value=>{
        setItems(value);
      })
      .catch(err=>{
        console.log(err)
      })

    return _=>uninstallEvent();

  }, [page, sensitive]);

  return [items, page];
}
//#endregion 'useInfiniteScroll'

//#region 'generateDumbBoardItems'
function generateDumbBoardItems(limit) {
  const items = [];

  const thumbnails = [
    'https://health.chosun.com/site/data/img_dir/2022/05/04/2022050401754_0.jpg',
    'https://img.freepik.com/premium-photo/ripe-red-apple-isolated-on-a-white-background_146936-1364.jpg?w=2000',
    'http://kormedi.com/wp-content/uploads/2020/09/201601291054128818_l_99_201601291123031.jpg',
    'http://res.heraldm.com/phpwas/restmb_idxmake.php?idx=507&simg=/content/image/2017/06/29/20170629000606_0.jpg'
  ]

  for(let i = 0; i < limit; i++){
    items.push({
      title: `제목~ ${i}`,
      subTitle: '부제목',
      detail: '무한 사과농장',
      writer: '작성자',
      tags: ['t1'],
      thumbnailUrls: {
        'x192' : thumbnails[Math.floor(Math.random() * 4)]
      }
    })
  }

  return items;
}
//#endregion

//#region 'useToggleButtonGroup'
function useToggleButtonGroup(
  valueObj,
) {

  const keys = Object.keys(valueObj)

  const [selected, setSelected] = useState(keys[0]);

  const handleChange = (evt, newSelected) => {
    setSelected(newSelected);
  }

  const Component = (
    <ToggleButtonGroup
      color="primary"
      onChange={handleChange}
      value={selected}
      exclusive
    >
      { keys.map(val => 
        <ToggleButton key={val} value={val}>{valueObj[val]}</ToggleButton>) 
      }
    </ToggleButtonGroup>
  );

  return [selected, Component];
}

//#endregion

export {
  useInfiniteScroll,
  generateDumbBoardItems,
  useToggleButtonGroup
}