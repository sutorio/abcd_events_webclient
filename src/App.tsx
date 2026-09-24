import { Title } from "@solidjs/meta";
import { Loading } from "solid-js";
import { paths, Router } from "@/router.ts";
import "@/App.css" with { type: "css" };

export default function App() {
  return (
    <Router>
      {(props) => (
        <>
          <Title>AbCD Events</Title>
          <nav>
            <a href={paths()}>Home</a>
            <a href={paths.users(1)}>Users</a>
          </nav>
          <Loading fallback={<main>Loading…</main>}>{props.children}</Loading>
        </>
      )}
    </Router>
  );
}
