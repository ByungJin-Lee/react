import { useEffect, useState } from "react";

//#region Interface

export interface Context<T, B> {
  pages: T[];
  status: Status;
  lastPage: T | undefined;
  /** Don't use variable out of this hook. This variable only used in hook. */
  blocked: boolean;
  /** additional information for hook */
  bundle?: B;
  /** Need to override for hook work. */
  operator: Operator<T, B>;
  plugins: Plugin<T, B>[];
}

export interface Operator<T, B> {
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

export interface Control<T, B> {
  pages: T[];
  status: Status;
  bundle?: B;
  isNextPage(): boolean;
  goNextPage(): Promise<boolean>;
  getCurrentCursor(): number | undefined;
}

/** Is better readonly Context? */
export type Plugin<T, B> = (context: Context<T, B>, commingData: T) => T;

export type Status = 'loading' | 'done';

//#endregion

function generateContext<T, B>(
  operator: Operator<T, B>,
  plugins: Plugin<T, B>[],
  bundle: B | undefined
) {

  const [_pages, _setPages] = useState<T[]>([]);
  const [_status, _setStatus] = useState<Status>('done');

  const context : Context<T, B> = {
    blocked: false,
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

      // Already fetch then stop.
      if(context.blocked) return false;

      const nextCursor = context.pages.length > 0 
        ? context.operator.getNextCursor(
            context.pages,
            context.bundle
          )
        : undefined;

      // set Status - loading
      context.status = 'loading';
      context.blocked = true;

      // get data using fetch
      const commingData = await context.operator.fetchNextPage(nextCursor, context.bundle);

      // process plugin like middleware.
      let processed = commingData as T;

      for (const plugin of context.plugins) {
        processed = plugin(context, processed);
        if(processed == undefined) break;
      }

      if(processed != undefined) {
        context.lastPage = processed;
      }
      
      // set Status - done
      context.status = 'done';
      context.blocked = false;

      return true;
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