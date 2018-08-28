# Levenshtein Matcher

1. Clone this repo.

2. Run `npm install`.

3. Use the `config.json` file to configure the following values:

| Key | Description |
|:----|:------------|
| tolerance | The levenshtein distance tolerance (0 means perfect match). |
| output | The filename of the CSV output relative to the project directory. |
| literals | The filename of the literals CSV relative to the project directory. |
| dictionary | The filename of the dictionary CSV relative to the project directory. |

4. Run `node match` to start matching.
