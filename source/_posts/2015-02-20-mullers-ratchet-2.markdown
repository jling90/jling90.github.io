---
layout: post
title: "Muller's ratchet pt.2"
date: 2015-02-20 00:30:03 +1000
comments: true
categories: 
---

If you missed the first part of this post, read it here:

From our code profiling we identified a function that was 

{% codeblock lang:R some title%}

get.parents<-function(w)
{
	N<-length(w)  # population size, inferred from the vector of fitness values 
	wmax<-max(w)  # maximum fitness in the population
	w<-w/wmax     # normalization
	
	Nnew<-0       # the size of the offspring population
	parents<-rep(0,N)
	
	while(Nnew<N)
	{
		n<-sample(N,1)        # randomly choose parental individual
		if(w[n]>runif(1))     # if fitness of that individual is greater than a random number
		{					  # make that individual an actual parent
			Nnew<-Nnew+1
			parents[Nnew]<-n
		}
	}
	parents
}

{% endcodeblock %}

In plain English, this function determines individuals in
the next generation from our current population. 


populating our new generation from the current generation

Here's how it works. We take our old 'population' - an array of floats
between 0 and 1, representing the 'fitness' of individuals - then
select (with replacement) an individual. We generate a random number
and if the individual's fitness 

Essentially we're performing a type of boot-strapping. We're sampling
a parent 

Following on from the first post, we can see that a lot is going on
within a while loop. As an initial strategy, I wanted to see whether I
could either replace the loop or reduce the amount of work that was
being performed inside it.



