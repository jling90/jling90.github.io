---
layout: post
title: "Muller's Ratchet pt. 1"
date: 2015-01-14 17:58:12 +1000
comments: true
categories: R, optimisation, vectorisation, genetics
---

One of the more interesting courses I took in science undergrad was 
*Ecological and Evolutionary Genetics*. Sometimes scientific processes
are perfect candidates for computational modelling and in our first
practical, I was ecstatic when we received code to experiment with.


###Muller's ratchet, watered down
The code we were given was an R script for simulating 
[Muller's ratchet](http://en.wikipedia.org/wiki/Muller%27s_ratchet), an
explanation for the accumulation of deleterious mutations in asexual
populations. One consequence of this mechanism is that as these 
deleterious mutations accrue in a population over time
(a phenomenon termed 
'genetic load'), the ability for the population to survive in its
environment is compromised. Ultimately this can lead to an increased
risk of extinction.

Genetic mutations occur stochastically through faulty DNA 
replication and repair or in response to environmental factors such
as ionizing radiation or chemical mutagens. A deleterious mutation
results in a phenotype ('trait') which reduces an
individual's 'fitness' - the ability for an organism to survive to 
produce offspring.

When asexual organisms reproduce, children are an identical
genetic clone of their parent. As such, asexual offspring
inherit all mutations from their parents 
(except in the rare case of backward mutation). 

In the absence of 
genetic recombination, mutations are preserved in 

these mutations can not be purged from the
genome and so in subsequent generations the number of deleterious
mutations in a family line necessarily increases.

Eventually, as a result of genetic drift the least loaded classes will
be lost. Each time this occurs represents a 'click' of Muller's ratchet
.

The rate of Muller's ratchet is given by 

### To the code

The script we were given modelled loading of individuals within a
population over evolutionary time. 

We were to investigate the effects of population size, *N*, mutation rate
, &mu;, and selection coefficient, *s* on the speed of Muller's ratchet.


Using the code we'd been provided with, I wanted to run a large number of
simulations to generate a nice profile of the variable-space. 

Unfortunately, the code as provided ran slowly making it painful
to generate a large quantity of results for analysis. Throwing more
processing power and memory at the code wasn't yielding much success so
rather than take the sensible route and work with what we had, it was
time to tinker with the code.


Thanks to the speed-up, here are some sweet space-blankets I got
around to making.



### R's hate-affair with loops

Experienced R programmers frequently push an idea which might seem
unusual to those coming from other languages: Loops are slow and should
be avoided.

This isn't strictly true of course, and loop structures exist in R as 
in most sensible tool for the task at hand. The idiom likely
comes forth because simple loop logic can frequently be replaced with
much more efficient vectorised operations.

Other users will also note that for-loops can often be
substituted with one of R's 
[apply](https://nsaunders.wordpress.com/2010/08/20/a-brief-introduction-to-apply-in-r/)
statements which can be more performant, and which some believe 
to be more readable. 

Regardless of which school of thought you belong to, a sensible first
step in interrogating slow R code is to find loops and regard them with
a bit of suspicion.

Here's a simple loop vs vector example for illustrative purposes.

{% codeblock lang:R vectorisation vs  %}
# Sample a vector of uniform, random numbers between 0 and 1.
vec = runif(10000000)

# Function for rounding numbers to 0 or 1 -- loop implementation.
round.loop <- function(vec){
    for(i in seq_along(vec)){
        vec[i] <- if (vec[i] < 0.5) 0 else 1
    }
}

# Function for rounding to 0 or 1 -- vector implementation.
round.vec <- function(vec){
    vec[vec < 0.5] <- 0
    vec[vec >= 0.5] <- 1

    # A bit of explanation. The expression 'vec[vec < 0.5] <- 0'
    # selects elements from vec where 'vec < 0.5' evaluates TRUE then
    # replaces these elements with 0. Likewise for values >=0.5.
}

# For completeness... using 'lapply'.
round.apply <- function(vec){
    lapply(vec, function(x){
        if (x < 0.5) 0 else 1
    })
}

# Time to test and profile...
test.wrapper <- function(func, arg){
    Rprof("test.out")
    result <- func(arg)
    Rprof(NULL)
    summaryRprof("test.out")
}

test.wrapper(round.loop, vec)
# $sampling.time
# [1] 26.54

test.wrapper(round.vec, vec)
# $sampling.time
# [1] 0.9

test.wrapper(round.apply, vec)
# $sampling.time
# [1] 47.42

{% endcodeblock %}

As we should all know, premature optimization is a cardinal sin, but
after performing some coarse profiling with Rprof, it turned out one
little function in our Muller's Ratchet script was taking up
approximately 98% of the script's execution time. In the next part of
this post, we'll be diving into the code and wriggling around a bit.


