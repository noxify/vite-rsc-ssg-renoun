import type { MDXComponents } from "renoun/mdx"
import { CodeBlock, CodeInline } from "renoun"

export function useMDXComponents() {
  return {
    h1: (props) => {
      return <h1 level={1} {...props} />
    },
    h2: (props) => {
      return (
        <h2 level={2} {...props} className="mt-8 mb-4 text-2xl font-bold" />
      )
    },
    h3: (props) => {
      return (
        <h3 level={3} {...props} className="mt-6 mb-3 text-xl font-semibold" />
      )
    },
    ul: (props) => {
      return <ul {...props} className="my-4 ml-6 list-disc" />
    },
    ol: (props) => {
      return <ol {...props} className="my-4 ml-6 list-decimal" />
    },
    a: (props) => {
      return (
        <a
          {...props}
          className="text-primary underline transition-colors hover:text-primary/80"
        />
      )
    },
    p: (props) => {
      return <p {...props} className="my-4 leading-relaxed" />
    },
    CodeBlock,
    CodeInline,
  } satisfies MDXComponents
}
