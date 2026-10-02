export function Datetime(props: { datetime: string }) {
  return (
    <time datetime={props.datetime}>
      {Temporal.PlainDateTime.from(props.datetime).toLocaleString(undefined, {
        timeStyle: "short",
        dateStyle: "long",
      })}
    </time>
  );
}
