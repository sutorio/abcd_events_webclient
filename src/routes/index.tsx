import { Title } from "@solidjs/meta";
import { query, type RouteDefinition } from "@solidjs/router";
import { For, createMemo } from "solid-js";
import { api } from "@/api-client.ts";
import { events } from "@/api-resources.ts";
import { Datetime } from "@/components/datetimes.tsx";
import { paths } from "@/router.ts";

const { PlainDateTime, Now } = Temporal;

const organisationId = 1;

const getUpcomingEvents = query(async () => {
  const rows = await api
    .get(events.path, {
      searchParams: { organisationId, visibility: "public" },
    })
    .json(events.schema);
  return rows
    .filter((e) => PlainDateTime.compare(PlainDateTime.from(e.startsAt), Now.plainDateTimeISO()) >= 0)
    .sort((a, b) => PlainDateTime.compare(PlainDateTime.from(a.startsAt), PlainDateTime.from(b.startsAt)));
}, "upcoming-events");

export const route = {
  preload: () => void getUpcomingEvents(),
} satisfies RouteDefinition;

export default function Home() {
  const upcoming = createMemo(() => getUpcomingEvents());

  return (
    <main>
      <Title>AbCD Events - Home</Title>
      <h1>Hello AbCD Events!</h1>
      <section aria-labelledby="overview-heading">
        <h2 id="overview-heading">Overview of AbCD Events</h2>
      </section>
      <section aria-labelledby="upcoming-heading">
        <h2 id="upcoming-heading">Upcoming Events</h2>
        <ul>
          <For
            each={upcoming()}
            fallback={<li>No upcoming events right now.</li>}
          >
            {(ev) => (
              <li>
                <a href={paths.events(ev.id)}>{ev.title}</a>
                <Datetime datetime={ev.startsAt} />
              </li>
            )}
          </For>
        </ul>
      </section>
    </main>
  );
}
