# Use Cases

## 1. Folder

### 1.1 Empty folder

```yml
folder1: [] # -> Create empty folder
```

### 1.2. Simple folder

```yml
folder1:
  - file1 # -> Create
  - fil2 # -> Create
```

## 2. Folder with links

```yml
folder1:
  - file1 # -> Create
  - file2->"target1" # -> Create Link
  # this may also be just a folder straight up
  - folder1->"target-folder1" # -> Create Link
```

## 3. Folder with subfolder

```yml
folder1:
  - file1 # -> Create
  - file2->"target1" # -> Create Link
  - folder2: # -> Recurse to Case 1.
      - file3
      - file4
```

## 4. Virtual Folder

### 4.1 Empty Virtual folder

```yml
folder1->"target-folder1": [] # Create Link
# Equivalent to
- folder1->"target-folder1"
```

### 4.2. Simple Virtual Folder

```yml
folder1->"target-folder1":
  - file1 # -> Create Expression-based Link
  - expression1 # -> Create Expression-based Link
  - expression2 # -> Create Expression-based Link
```

## 5. Virtual folder with links

```yml
folder1->"target-folder1":
  - file1 # -> Create Expression-based Link
  - file2->"target1" # -> Create Link
  - folder1->"target-folder1" # -> Create Link
  - expression1 # -> Create Expression-based Link
  - expression2 # -> Create Expression-based Link
```

## Recursive Cases

## 6. Virtual folder with subfolder

```yml
folder1->"target-folder1":
  - file1 # -> Create Expression-based Link
  - folder2 # -> Create Expression-based Link
  # Expression-based links can also point to folders

  ## HIGHLY DISCOURAGED
  ## Will just create a folder according to structure

  ## Multiple nestings not supported
  - folder3: # -> Recurse to Case 1
      - file2
      - file3

  ## Use expression like that if trying to point to file in subfolder
  - folder3/file2 # -> Create Expression-based Link
  - folder3/file3 # -> Create Expression-based Link
```

## 7. Virtual folder with Virtual subfolder

```yml
folder1->"target-folder1":
  - file1 # -> Create Expression-based Link
  - folder2->"target-folder2": # -> Recurse to case 4.
      - file2
      - expression1
      - expression2
```

Link files become link entries (may be file, may be folder)

Validation:

```yml
root-folder:
  - file1-link.txt->"file1.txt"
  - file1.txt
  - file2.json
  - sub-folder-1-link->"sub-folder-1"
  - sub-folder-1:
      - abc.json
      - otherfile.yaml
    abc2: someotherValue
  - "sub-folder-1-link-extra->sub-folder-1":
      - "*.yml"
      - "*.yaml"
```
