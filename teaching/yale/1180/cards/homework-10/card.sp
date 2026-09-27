@@@
	import { gap, problem as p, problemNumberNextRange as next, problemNumberPreviousRange as prev, problemNumberRange as range } from "../../../../../build/spruce.js";

	function document(body)
	{
		return body;
	}
@@@
	
*Due Sunday, December 7th at 11:59 PM*

Complete the following problems and submit them as a pdf to Gradescope. You should show enough work that there is no question about the mathematical process used to obtain your answers, and so that your peers in the class could easily follow along. I encourage you to collaborate with your classmates, so long as you write up your solutions independently. If you collaborate with any classmates, please include a statement on your assignment acknowledging with whom you collaborated.

@gap

In problems @next(6), determine if the linear transformation $T$ is one-to-one, if it is onto, and if it is invertible. If it is invertible, find the inverse transformation.

@p[$T: #R#^2 \to #R#^2$ defined by $T\left([[ x ; y ]]\right) = [[ 2x + y ; x + 2y]]$.]

@p[$T: #R#^3 \to #R#^2$ defined by $T\left([[ x ; y ; z ]]\right) = [[ x ; y + z ]]$.]

@p[$T: #R#^2 \to #R#^2$, where]

$$
	T\left([[ 2 ; 0 ]]\right) = [[ 2 ; 4 ]] \qquad T\left([[ 4 ; 6 ]]\right) = [[ 4 ; -10 ]].
$$

@p[$T: #R#^3 \to #R#^3$, where]

$$
	T\left([[ 1 ; 1 ; 1 ]]\right) = [[ 3 ; 7 ; 4 ]] \qquad T\left([[ 1 ; 2 ; 0 ]]\right) = [[ 1 ; -1 ; 3 ]] \qquad T\left([[ 0 ; 1 ; 3 ]]\right) = [[ 6 ; 16 ; 7 ]].
$$

@p[$T: #R#^3 \to #R#$, where]

$$
	T\left([[ 1 ; -1 ; 1 ]]\right) = -3 \qquad T\left([[ 1 ; 0 ; 1 ]]\right) = 1 \qquad T\left([[ 0 ; 1 ; 1 ]]\right) = 4.
$$

@p[$T: #R#^5 \to #R#^2$, where]

$$
	T\left([[ 1 ; 0 ; 2 ; 3 ; 0 ]]\right) = [[ 1 ; 1 ]] \qquad T\left([[ 2 ; 1 ; 2 ; -1 ; 3 ]]\right) = [[ 2 ; 0 ]].
$$

@gap

@p[Let $R : #R#^2 \to #R#^2$ be a function (not necessarily a linear transformation) defined by rotating its inputs $90^\circ$ counterclockwise. For example, $R\left( [[ 1 ; 0 ]] \right) = [[ 0 ; 1 ]]$ and $R\left( [[ \frac{1}{2} ; \frac{\sqrt{3}}{2} ]] \right) = [[ -\frac{\sqrt{3}}{2} ; \frac{1}{2} ]]$.]

+ Explain with a picture why $R$ is in fact a linear transformation, i.e. $R(\vec{v_1} + \vec{v_2}) = R(\vec{v_1}) + R(\vec{v_2})$ and $R(c\vec{v}) = cR(\vec{v})$.

+ Find the matrix for $R$.

+ Let $R_\theta : #R#^2 \to #R#^2$ be the linear transformation that rotates its inputs an angle $\theta$ counterclockwise, where $\theta$ is a variable. Find a matrix for $R_\theta$.

@gap

In problems @next(5), compute the determinant of the given matrix.

@p[$$A = [[ 2, 3 ; -3, 1 ]]$$.]

@p[$$B = [[ 2, 3, 0 ; -3, 1, -1 ; 1, 1, 1 ]]$$.]

@p[$$C = [[ 1, 1, -3 ; 0, 1, 3 ; 2, -1, -15 ]]$$.]

@p[$$D = [[ 1, 2, 3 ; 4, 5, 6 ]]$$.]

@p[$$E = [[ 1, 2, 3, 4 ; 3, -1, 0, 3 ; 2, 0, 1, 2; -1, -3, -7, 2 ]]$$.]

@gap

@p[For each of the matrices $A$--$E$ in problems #-5--#-1, classify it as invertible or noninvertible based on its determinant.]

@p[Let $A$ be the matrix from problem #-6. Sketch a picture of the unit square in $#R#^2$ and its image under the linear operator corresponding to $A$. Verify that the area of that image is $|\det A|$ times the area of the unit square (i.e. $1$).]

@p[We can use the multiplicativity of the determinant to show some nice facts about the determinants of inverse matrices.]

+ The identity matrix $I$ has the same determinant no matter what size it is. What is $\det I$?

+ Let $A$ be an invertible matrix. Using part a), find $\det A^{-1}$ in terms of $\det A$.