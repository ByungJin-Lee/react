import { useEffect, useState } from "react";

//#region Interface

interface Context<T, B> {
  _status: Status,
  _pages: T[],
  status: Status;
  pages: T[];
  lastPage: T | undefined;
  bundle?: B;
  /**
   * Need to override for hook work.
   */
  operator: Operator<T, B>;
  plugins: Plugin<T, B>[];
}

interface Operator<T, B> {
  /**
   * Calculate Next Page Cursor.
   * If there is next cursor, then return number.
   * But if not cursor(means no more page), return undefined.
   * @param lastPage 
   * @param totalPages 
   */
  getNextCursor(pages: T[], bundle?: B): number | undefined;
  /**
   * Fetch Next Page.
   * @param nextCursor the cursor that was calculated by 'getNextCursor'.
   */
  fetchNextPage(nextCursor?: number, bundle?: B): Promise<T>;
}

interface Hook<T> {
  setPages : React.Dispatch<React.SetStateAction<T[]>>
}

interface Control<T, B> {
  pages: T[];
  status: Status;
  bundle?: B;
  isNextPage(): boolean;
  goNextPage(): Promise<void>;
  getCurrentCursor(): number | undefined;
}

type Plugin<T, B> 
  = (context: Readonly<Context<T, B>>, commingData: T) => T;

type Status = 'loading' | 'done';

//#endregion

function generateContext<T, B>(
  operator: Operator<T, B>,
  plugins: Plugin<T, B>[],
  bundle: B | undefined
) {

  const [_pages, _setPages] = useState<T[]>([]);
  const [_status, _setStatus] = useState<Status>('done');

  const context : Context<T, B> = {
    _status, // Default Status
    _pages, // Empty Pages
    bundle,
    plugins,
    operator,
    //#region Status
    get status() {
      return _status;
    },
    set status(value: Status) {
      _setStatus(value);
    },
    //#endregion
    //#region Pages
    get pages() {
      return _pages;
    },
    set pages(values: T[]) {
      _setPages(values);
    },
    //#endregion
    //#region LastPage
    get lastPage() {
      return _pages[_pages.length - 1];
    },
    set lastPage(value: T) {
      _setPages(prev => {
        prev.push(value);
        return prev;
      })
    }
    //#endregion
  }
  
  return context;
}

function generateControl<T, B>(context: Context<T,B>) {



  const control : Control<T,B> = {
    pages: context.pages,
    status: context.status,
    bundle: context.bundle,

    isNextPage() {
      return context.pages.length > 0 
        && context.operator.getNextCursor(
          context.pages,
          context.bundle
        ) != undefined;
    },
    /**
     * Before call this function, you must check that Next Cursor is exist? (isNextPage)
     */
    async goNextPage() {

      const nextCursor = context.pages.length > 0 
        ? context.operator.getNextCursor(
            context.pages,
            context.bundle
          )
        : undefined;

      // set Status - loading
      context.status = 'loading';

      // get data using fetch
      const commingData = await context.operator.fetchNextPage(nextCursor);

      // process plugin like middleware.
      let processed = commingData as T;

      for (const plugin of context.plugins) {
        processed = plugin(context, processed);
        if(processed == undefined) break;
      }
      
      // set Status - done
      context.status = 'done';

      if(processed != undefined) {
        context.lastPage = processed;
      }
    },

    getCurrentCursor() {
      return context.pages.length;
    }
  };

  return control;
}


export default function useInfinitePage<T, B>(
  operator: Operator<T, B>,
  plugins: Plugin<T,B>[],
  initialBundle?: B
) {

  const context = generateContext<T,B>(
    operator,
    plugins,
    initialBundle
  );

  const control = generateControl<T,B>(context);

  useEffect(()=> {
    control.goNextPage();
  }, []);
  // get first page;
  
  return control;
}