letfun fact n = 
    if n <= 1
    then 1
    else n * fact: (n - 1)
let a = 5
let b = a
let c = a + b
let d = (c - a)
let e = c - (c - a)
let f = (a+b, 13, fact: 3, fact: 5)
let g = (42, 13, (10, 120, 1), 7)["2"]  ["1"]
in f 3