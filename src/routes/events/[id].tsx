import { Title } from "@solidjs/meta";
import { int, query, type RouteProps } from "@solidjs/router";
import { defineFileRoute } from "@solidjs/router/fs";
import { createMemo } from "solid-js";
import { api } from "@/api-client.ts";
import { event } from "@/api-resources.ts";
import { Datetime } from "@/components/datetimes.tsx";
import { paths } from "@/router.ts";

const getEvent = query(async (id: number) => {
  return api.get(event.path(id)).json(event.schema);
}, "event");

export const route = defineFileRoute("/events/:id", {
  matchFilters: { id: int },
  preload: ({ params }) => void getEvent(Number(params.id)),
});

export default function EventPage(props: RouteProps<typeof route>) {
  const ev = createMemo(() => getEvent(Number(props.params.id)));

  return (
    <main>
      <Title>{`${ev().title} - AbCD Events`}</Title>
      <p>
        <a href={paths()}>Home</a>
      </p>
      <h1>{ev().title}</h1>
      <p>
        <Datetime datetime={ev().startsAt} />
      </p>
      <p>{ev().description}</p>
    </main>
  );
}
