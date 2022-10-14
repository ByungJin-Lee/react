import { useEffect, useState } from "react";

export class Context<T, B> {
  //#region State
  private _setPages: React.Dispatch<React.SetStateAction<T[]>>;
  private _setStatus: React.Dispatch<React.SetStateAction<Status>>;
  private _pages: T[];
  private _status: Status;
  //#endregion

  private blocked: boolean;
  public readonly bundle?: B;
  private readonly plugins: Plugin<T, B>[];
  private readonly operator: Operator<T,B>;

  constructor(
    operator: Operator<T, B>, 
    plugins: Plugin<T,B>[],
    bundle?: B
  ) {
    [this._pages, this._setPages] = useState<T[]>([]);
    [this._status, this._setStatus] = useState<Status>('done');
    this.operator = operator;
    this.plugins = plugins;
    this.bundle = bundle;
    this.blocked = false;
  }

  processWithPlugin(comming: T) {
    let processed : T = comming;
    for (const plugin of this.plugins) {
      if((processed = plugin(this, processed)) == undefined) break;
    }
    return processed;
  }

  block() {
    this.blocked = true;
    this.status='loading';
  }
  unblock() {
    this.blocked = false;
    this.status = 'done';
  }
  isBlocked() {
    return this.blocked;
  }

  get nextCursor() {
    if(this.pages.length > 0){
      return this.operator.getNextCursor(
        this.pages,
        this.bundle
      );
    }
    return undefined;
  }

  fetchNextPage() {
    return this.operator.fetchNextPage(this.nextCursor, this.bundle);
  }

  //#region Getter/Setter
  get pages() : T[] {
    return this._pages;
  }
  /**
   * If value type is array, then assign or not append.
   */
  set pages(value: T[] | T) {
    if(Array.isArray(value)){
      this._setPages(value);
    }else{
      this._setPages(prev=>{
        prev.push(value);
        return prev;
      });
    }
  }

  get status() {
    return this._status;
  }
  set status(value: Status) {
    this._setStatus(value);
  }
  //#endregion
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

/** Is better readonly Context? */
export type Plugin<T, B> = (context: Context<T, B>, commingData: T) => T;

export type Status = 'loading' | 'done';

function handleFromContext<T,B>(context: Context<T,B>) {
  return {
    get pages() {
      return context.pages;
    },
    get status() {
      return context.status;
    },
    getCurrentCursor() {
      return context.pages.length;
    },
    isNext() {
      return context.nextCursor != undefined;
    },
    async fetchNext() {
      // Already fetch then stop.
      if(context.isBlocked()) return false;
      // set Status - loading
      context.block();
      // get data using fetch
      const commingData = await context.fetchNextPage();
  
      if(commingData) {
        // process plugin like middleware.
        const processed = context.processWithPlugin(commingData);
        if(processed) context.pages = processed;
        // set Status - done
        context.unblock();
        return true;
      }
      return false;
    }
  }
}
//#endregion


export default function useInfinitePage<T, B>(
  operator: Operator<T, B>,
  plugins: Plugin<T,B>[],
  initialBundle?: B
) {

  const context = new Context<T,B>(operator, plugins, initialBundle);
  const control = handleFromContext<T,B>(context);

  useEffect(()=> {
    // get first page;
    control.fetchNext();
  }, []);
  
  return control;
}