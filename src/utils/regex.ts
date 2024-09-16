export const unescapeRegexSource = (regexSource: string | RegExp): string => {
  /*
      Conceptually, the source property is the text between the two forward slashes in the regular expression literal.
      The language requires the returned string to be properly escaped, so that when the source is concatenated with a forward slash on both ends, 
      it would form a parsable regex literal. For example, for new RegExp("/"), the source is \\/, because if it generates /, the resulting literal becomes ///, 
      which is a line comment. Similarly, all line terminators will be escaped because line terminator characters would break up the regex literal.
      There's no requirement for other characters, as long as the result is parsable. For empty regular expressions, the string (?:) is returned.
      
      -- source https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/source#description
       */
  if (typeof regexSource === "object") regexSource = regexSource.source;

  if (regexSource === "(?:)") return "";

  return regexSource.replace(/\\\//g, "/");
};
