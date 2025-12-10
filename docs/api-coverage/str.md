---
layout: default
title: String
parent: API Coverage
---

## String

### Query

| Function           | Status | Description                        |
| ------------------ | ------ | ---------------------------------- |
| `str.contains()`   | ✅     | Check if string contains substring |
| `str.endswith()`   | ✅     | Check if string ends with suffix   |
| `str.length()`     | ✅     | Get string length                  |
| `str.match()`      | ✅     | Match string against regex         |
| `str.pos()`        | ✅     | Find position of substring         |
| `str.startswith()` | ✅     | Check if string starts with prefix |

### Formatting

| Function            | Status | Description                  |
| ------------------- | ------ | ---------------------------- |
| `str.format()`      | ✅     | Format string with arguments |
| `str.format_time()` | ❌     | Format time value            |

### Transformation

| Function            | Status | Description              |
| ------------------- | ------ | ------------------------ |
| `str.lower()`       | ✅     | Convert to lowercase     |
| `str.repeat()`      | ✅     | Repeat string            |
| `str.replace()`     | ✅     | Replace first occurrence |
| `str.replace_all()` | ✅     | Replace all occurrences  |
| `str.trim()`        | ✅     | Remove whitespace        |
| `str.upper()`       | ✅     | Convert to uppercase     |

### Parsing

| Function          | Status | Description             |
| ----------------- | ------ | ----------------------- |
| `str.split()`     | ✅     | Split string into array |
| `str.substring()` | ✅     | Extract substring       |

### Conversion

| Function         | Status | Description             |
| ---------------- | ------ | ----------------------- |
| `str.tonumber()` | ✅     | Parse string to number  |
| `str.tostring()` | ✅     | Convert value to string |
