export const TIME_REGEX = /^[0-5][0-9][:][0-5][0-9][.]\d\d\d$/;

export function ConvertTimeStringToMilliseconds(time: string): number {
  let result = 0;
  const splitByDoublePoints = time.split(":");
  let minutes = splitByDoublePoints[0];
  let splitByPoint = splitByDoublePoints[1].split(".");
  let seconds = splitByPoint[0];
  let millisecond = splitByPoint[1];

  result += Number.parseInt(minutes) * 60 * 1000;
  result += Number.parseInt(seconds) * 1000;
  result += Number.parseInt(millisecond);
  return result;
}
