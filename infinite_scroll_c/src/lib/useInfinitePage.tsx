import React, { useRef, useState } from 'react';

export class Context<T, B> {
  /** Flag to check already fetching */
  private blocked: boolean;
  /** Additional Information to run operator/contex. */
  public readonly bundle?: B;
  /** Post-process for comming data to append Pages. (Like middleware) */
  private readonly plugins: Plugin<T, B>[];
  /** External operation to work Hook. */
  private readonly operator: Operator<T, B>;

  constructor(operator: Operator<T, B>, plugins: Plugin<T, B>[], bundle?: B) {
    this.operator = operator;
    this.plugins = plugins;
    this.bundle = bundle;
    this.blocked = false;
  }

  processWithPlugin(comming: T) {
    let processed: T = comming;
    for (const plugin of this.plugins) {
      if ((processed = plugin(this, processed)) == undefined) break;
    }
    return processed;
  }

  block() {
    this.blocked = true;
  }
  unblock() {
    this.blocked = false;
  }
  isBlocked() {
    return this.blocked;
  }

  getNextCursor(pages: T[]) {
    if(pages.length > 0) {
      return this.operator.getNextCursor(pages, this.bundle);
    }
    return undefined;
  }

  async getNextPage(nextCursor: number | undefined) {
    return this.processWithPlugin(
      await this.operator.fetchNextPage(nextCursor, this.bundle),
    );
  }
}

/** External operation to work Hook. */
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

//#region Impl

function handleFromContext<T, B>(context: Context<T, B>) {

  const [_pages, _setPages] = useState<T[]>([]);
  const [_status, _setStatus] = useState<Status>('done');

  const self = {
    /** State - Pages fetched so far.
     * ???????????? ????????? ????????? ??????
     */
    get pages() {
      return _pages;
    },
    /**
     * State - Current Fetching Status(ref. Status Type)
     *  ?????? Fetching ??????
     */
    get status() {
      return _status;
    },
    set status(value: Status) {
      console.log(value);
      switch(value) {
        case 'done':
          context.unblock();
          break;
        case 'loading':
          context.block();
          break;
      }
      _setStatus(value);
    },
    /** Return Current Cursor Position. */
    getCurrentCursor() {
      return _pages.length;
    },
    /** Check If next cursor exists. */
    isNext() {
      return context.getNextCursor(_pages) != undefined;
    },
    /** Fetch Next Page. Make sure that must be next Cursor!
     * ????????? isNext??? ?????? Next Cursor??? ???/?????? ???????????? ???????????????.
     */
    async fetchNext() {
      // Already fetch then stop.
      if (context.isBlocked()) return false;
      // set Status - loading
      self.status = 'loading';

      const commingPage = await context.getNextPage(
        context.getNextCursor(_pages)
      );

      if (commingPage) _setPages(prev=>{
        prev.push(commingPage);
        return prev;
      })
      // set Status - done
      self.status = 'done';
      return commingPage != undefined;
    },
  };

  return self;
}
//#endregion

/**
 * Operation??? ??? ???????????? ???????????????.
 * @param operator External Operation to work hook. (ref. Operator Interface)
 * @param plugins Post-process for comming data to append Pages.
 * @param initialBundle An Object to initialize Bundle.
 * @returns
 */
export default function useInfinitePage<T, B>(
  operator: Operator<T, B>,
  plugins: Plugin<T, B>[],
  initialBundle?: B,
) {
  const context = useRef<Context<T,B>>();

  if(!context.current){
    context.current = new Context<T,B>(operator, plugins, initialBundle);
  }

  return handleFromContext<T, B>(context.current as Context<T,B>);
}

//#endregion