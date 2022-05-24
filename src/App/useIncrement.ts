import { useState } from "react";

export default function useIncrement() {
  const [state, setState] = useState(0);

  return { state, setState };
}
