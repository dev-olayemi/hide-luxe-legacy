// types/styled-jsx.d.ts   (or add to any existing .d.ts file)
declare module "react" {
  interface StyleHTMLAttributes<T> {
    jsx?: boolean;
    global?: boolean;
  }

  export function useEffect(arg0: () => void, arg1: (string | { name: string; price: number; image: string; description: string; currency?: string; })[]) {
    throw new Error('Function not implemented.');
  }

  export function useState<T>(defaultCategories: CategoryItem[]): [any, any] {
    throw new Error('Function not implemented.');
  }
}
