# knoftobor
Mass-manage your repositories by selecting them based on globbing patterns and filter functions. Summarize the results
or execute shell commands

```
          _---~~-_
         :        "-.
        /   /'''" }) \
       :   : ^ \^ :/  )
       /    \  - //  /
      |     /  -/ ' /
       '~ \} -.-'../
      /           .
     /   /'     ^  \
    '  /  \ .@.' '..@
   '  /    \       \
  /  |      |       |
 /  /       /    '   \
 | '       '          '
 |  \     |     .-~-   \
 |/^ .   '       )/     '
 v  .  \/       / \      \
    )  |      /'   )\     |
   ( _\     ./    ( '     .
    '--.___'      '--''---
```

## To install

Run the following:

```
$ npm i wvbe/knoftobor -g
```

And add a file `.knoftoborrc` to the directory that contains your git repositories. It uses globbing patterns relative from the directory where your .knoftoborrc is found. To manage all the direct children of a folder through knoftobor, it should contain JSON like this:

```
{
	"roots": ["*/"]
}
```

If your repositories actually are in subdirectories you could set the `roots` property to `["*/*/"]`, `["apps/*/", "vendor/*/"]`, and so on.

## To use

List all repositories:

```
knoftobor
```

List all repositories that are on branch "master":

```
knoftobor -f on-branch:master
```

List all repositories (and some extra info) that do not have a "develop" branch:

```
knoftobor -f ~has-branch:develop -c name branch tag status origin
```

Execute something in on a selection of repositories:

```
knoftobor -f has-remote-branch:develop ~on-branch:develop -$ git pull -r origin develop
```

Help with all the other cool things you can do:

```
$ knoftobor -h
```
