import "temporal-polyfill/global";
import { Title } from "@solidjs/meta";
import { Loading } from "solid-js";
import { paths, Router } from "@/router.ts";

export default function App() {
  return (
    <Router>
      {(props) => (
        <>
          <Title>AbCD Events</Title>
          <nav>
            <a href={paths()}>Home</a>
          </nav>
          <Loading fallback={<main>Loading…</main>}>{props.children}</Loading>
        </>
      )}
    </Router>
  );
}
