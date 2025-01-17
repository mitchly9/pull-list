export const parseTeeTimeData = (text: string) => {
  // Extract unique bag numbers
  const bagNumbers = Array.from(
    new Set(text.match(/(?<=\S) (\d+)/g)?.map(Number) || [])
  );

  // Extract bag and PC associations
  const pcNumbers = Array.from(text.matchAll(/(\d+)\s+PC\s*(\d+)/g)).map(
    ([, bag, pc]) => ({ bag: Number(bag), pc: Number(pc) })
  );

  // Extract marked numbers (COC, MOC, PC)
  const markedNumbers = new Set(
    Array.from(text.matchAll(/(\d+)\s+(COC|MOC|PC)/g)).map(([, bag]) =>
      Number(bag)
    )
  );

  // Filter marked numbers not associated with PC
  const pcAssociatedNumbers = new Set(pcNumbers.map(({ bag }) => bag));
  const filteredMarkedNumbers = Array.from(
    new Set([...markedNumbers].filter((num) => !pcAssociatedNumbers.has(num)))
  );

  console.log(filteredMarkedNumbers);
  // Create ranges
  const ranges = {
    "1-72": bagNumbers.filter((num) => num >= 1 && num <= 72),
    "73-144": bagNumbers.filter((num) => num >= 73 && num <= 144),
    "145-216": bagNumbers.filter((num) => num >= 145 && num <= 216),
    "217-252": bagNumbers.filter((num) => num >= 217 && num <= 252),
    "253-324": bagNumbers.filter((num) => num >= 253 && num <= 324),
    "325+": bagNumbers.filter((num) => num >= 325),
  };

  const timeRegex = /(\d{1,2}:\d{2} (?:AM|PM))/g;
  const matches = Array.from(text.matchAll(timeRegex));

  const timesWithBags: { time: string; bagNumbers: number[] }[] = [];

  for (let i = 0; i < matches.length; i++) {
    const currentTime = matches[i][1]; // Current matched time
    const nextMatchIndex = matches[i + 1]?.index || text.length; // End index for the next time or end of the text

    // Extract the content between the current time and the next time
    const content = text.slice(
      matches[i].index! + currentTime.length,
      nextMatchIndex
    );

    // Find all bag numbers (e.g., "PC30" or other numbers)
    const bagNumbers = Array.from(
      new Set(content.match(/(?<=\S) (\d+)/g)?.map(Number) || [])
    );
    timesWithBags.push({ time: currentTime, bagNumbers });
  }

  return { ranges, pcNumbers, filteredMarkedNumbers, timesWithBags };
};
