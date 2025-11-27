// types/styled-jsx.d.ts   (or add to any existing .d.ts file)
declare module "react" {
  interface StyleHTMLAttributes<T> {
    jsx?: boolean;
    global?: boolean;
  }
}
