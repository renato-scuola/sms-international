/**
 * Sfondo animato: è ciò che il vetro rifrange.
 * Componente server, puro markup: zero JavaScript inviato al browser.
 */
export default function Aurora() {
  return (
    <div className="aurora" aria-hidden="true">
      <div className="aurora__blob aurora__blob--1" />
      <div className="aurora__blob aurora__blob--2" />
      <div className="aurora__blob aurora__blob--3" />
      <div className="aurora__grain" />
    </div>
  );
}
