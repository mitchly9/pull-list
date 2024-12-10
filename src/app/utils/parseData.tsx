export const parseTeeTimeData = (text: string) => {
  const bagNumbers = Array.from(
    new Set(text.match(/(?<=\S) (\d+)/g)?.map(Number) || [])
  );

  const pcNumbers = Array.from(text.matchAll(/(\d+)\s+PC\s*(\d+)/g)).map(
    ([_, bag, pc]) => ({ bag: Number(bag), pc: Number(pc) })
  );

  const markedNumbers = new Set(
    Array.from(text.matchAll(/(\d+)\s+(COC|MOC|PC)/g)).map(([_, bag]) =>
      Number(bag)
    )
  );

  const pcAssociatedNumbers = new Set(pcNumbers.map(({ bag }) => bag));
  const filteredMarkedNumbers = Array.from(
    new Set([...markedNumbers].filter((num) => !pcAssociatedNumbers.has(num)))
  );

  const ranges = {
    "1-72": bagNumbers.filter((num) => num >= 1 && num <= 72),
    "73-144": bagNumbers.filter((num) => num >= 73 && num <= 144),
    "145-216": bagNumbers.filter((num) => num >= 145 && num <= 216),
    "217-252": bagNumbers.filter((num) => num >= 217 && num <= 252),
    "253-324": bagNumbers.filter((num) => num >= 253 && num <= 324),
    "325+": bagNumbers.filter((num) => num >= 325),
  };

  return { ranges, pcNumbers, filteredMarkedNumbers };
};
