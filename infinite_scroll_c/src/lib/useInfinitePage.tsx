import { useEffect, useState } from "react";

type Status = 'loading' | 'done';

interface Context<T, B> {
  currentCursor: number;
  status: Status;
  pages: T[];
  bundle?: B;
  hooks: Hooks<T>;
  /**
   * Need to override for hook work.
   */
  operator: Operator<T>;
  plugins: Plugin<T, B>[];
}

interface Hooks<T> {
  setPages: React.Dispatch<React.SetStateAction<T[]>>;
  setStatus: React.Dispatch<React.SetStateAction<Status>>;
}

interface Operator<T> {
  /**
   * Calculate Next Page Cursor.
   * If there is next cursor, then return number.
   * But if not cursor(means no more page), return undefined.
   * @param lastPage 
   * @param totalPages 
   */
  getNextCursor(lastPage: T, totalPages?: T[]): number | undefined;
  /**
   * Fetch Next Page.
   * @param nextCursor the cursor that was calculated by 'getNextCursor'.
   */
  fetchNextPage(nextCursor?: number): Promise<T>;
}

type Plugin<T, B> 
  = (context: Readonly<Context<T, B>>, commingData: T) => T;

interface Control<T, B> {
  pages: T[];
  status: Status;
  bundle?: B;
  isNextPage(): boolean;
  goNextPage(): Promise<void>;
  getCurrentCursor(): number | undefined;
}

function generateContext<T, B>(
  operator: Operator<T>,
  plugins: Plugin<T, B>[],
  bundle: B | undefined
) {

  const [pages, setPages] = useState<T[]>([]);
  const [status, setStatus] = useState<Status>('done');

  const context : Context<T, B> = {
    currentCursor: -1,
    status,
    pages,
    bundle,
    plugins,
    operator,
    hooks: {
      setPages,
      setStatus,
    }
  }
  
  return context;
}

function generateControl<T, B>(context: Context<T,B>) {


  const control : Control<T,B> = {
    pages: context.pages,
    status: context.status,
    bundle: context.bundle,

    isNextPage() {
      return context.operator.getNextCursor(
        context.pages[context.pages.length - 1],
        context.pages
      ) != undefined;
    },
    /**
     * Before call this function, you must check that Next Cursor is exist? (isNextPage)
     */
    async goNextPage() {

      const nextCursor = context.pages.length > 0 
        ? context.operator.getNextCursor(
            context.pages[context.pages.length - 1],
            context.pages
          )
        : undefined;

      // set Status - loading
      context.hooks.setStatus('loading');

      // get data using fetch
      const commingData = await context.operator.fetchNextPage(nextCursor);

      // process plugin like middleware.
      context.plugins.forEach(plugin => {
        const processed = plugin(context, commingData);
        context.hooks.setPages(prev => {
          prev.push(processed);
          return prev;
        });
      });

      // set Status - done
      context.hooks.setStatus('done');

      if(nextCursor) context.currentCursor = nextCursor;
    },

    getCurrentCursor() {
      return context.currentCursor;
    }
  };

  return control;
}


export default function useInfinitePage<T, B>(
  operator: Operator<T>,
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