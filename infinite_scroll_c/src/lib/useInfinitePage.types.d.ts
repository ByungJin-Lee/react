import React, { useState } from "react";

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

export declare class IContext<T, B> {
  //#region State
  private _setPages: React.Dispatch<React.SetStateAction<T[]>>;
  private _setStatus: React.Dispatch<React.SetStateAction<Status>>;
  private _pages: T[];
  private _status: Status;
  //#endregion

  readonly public operator: Operator<T,B>;
  readonly public bundle: B;

  constructor(
    operator: Operator<T, B>, 
    plugins: Plugin<T,B>[],
    bundle?: B
  ) {
    [this._pages, this._setPages] = useState<T[]>([]);
    [this._status, this._setStatus] = useState<Status>('done');
    this.operator = operator;
    this.bundle = bundle;
  }

  get pages() {
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

    return this._setPages()
  }

  get status() {
    return this._status;
  }
  set status(value: Status) {
    this._setStatus(value);
  }
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