
import { AppRouter } from '../src/framework/router';

export function Root({ url }: { url: URL }) {
  return <AppRouter url={url} />;
}
