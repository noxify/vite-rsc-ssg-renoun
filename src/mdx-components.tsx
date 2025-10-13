import { CodeBlock, CodeInline } from "renoun"

export function useMDXComponents() {
  return {
    h1: (props) => {
      return <h1 level={1} {...props} />
    },
    h2: (props) => {
      return <h2 level={2} {...props} />
    },
    h3: (props) => {
      return <h3 level={3} {...props} />
    },
    h4: (props) => {
      return <h4 level={4} {...props} />
    },
    h5: (props) => {
      return <h5 level={5} {...props} />
    },
    h6: (props) => {
      return <h6 level={6} {...props} />
    },
    CodeBlock,
    CodeInline
  }
}