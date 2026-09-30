import { Title } from "@solidjs/meta";
import Counter from "@/components/Counter.tsx";
import logo from "@/logo.svg";

export default function Home() {
  return (
    <main>
      <Title>AbCD Events - Home</Title>
      <img src={logo} class="logo" alt="Solid logo" />
      <h1>Hello Solid!</h1>
      <Counter />
      <p>
        Edit <code>src/routes/index.tsx</code> and save to reload.
      </p>
    </main>
  );
}
