import { initials } from '../utils.js';

const COLORS = ['#0E7C7B', '#5B6CC9', '#B8477A', '#B5651D', '#7A5BB5', '#2E9B6A'];

export default function Avatar({ name = '', size = 36 }) {
  const hue = COLORS[[...name].reduce((a, c) => a + c.charCodeAt(0), 0) % COLORS.length];
  return (
    <span className="avatar" style={{ width: size, height: size, background: hue, fontSize: size * 0.38 }} aria-hidden="true">
      {initials(name)}
    </span>
  );
}
