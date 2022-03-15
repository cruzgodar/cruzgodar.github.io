"use strict";



onmessage = async function(e)
{
	if (hardmode === null)
	{
		hardmode = e.data[1];
	}
	
	correct_solution = e.data[2];
	
	grade_submission(e.data[0]);
}



let correct_solution = null;

let hardmode = null;

let first_guess = true;

let valid_guesses = [];
let valid_solutions = [];



fetch("/applets/wordle-scorer/scripts/data.json")

.then(response => response.json())

.then((data) =>
{
	valid_solutions = data["solutions"];
	valid_guesses = data["guesses"];
});



function grade_submission(entry_string)
{
	if (first_guess)
	{
		if (valid_guesses.indexOf(correct_solution) === -1)
		{
			valid_guesses.push(correct_solution);
		}
		
		if (valid_solutions.indexOf(correct_solution) === -1)
		{
			valid_solutions.push(correct_solution);
		}
	}
	
	
	
	if (valid_guesses.indexOf(entry_string) === -1)
	{
		postMessage([-1]);
		
		return;
	}
	
	
	
	//First, select some words from the set of current possibilities for grading.
	let grading_words = new Array(valid_solutions.length);
	
	for (let i = 0; i < grading_words.length; i++)
	{
		let index = Math.floor(Math.random() * valid_solutions.length);
		
		grading_words[i] = valid_solutions[index];
		
		valid_solutions.splice(index, 1);
	}
	
	for (let i = 0; i < grading_words.length; i++)
	{
		valid_solutions.push(grading_words[i]);
	}
	
	
	
	let words_by_score = [];
	
	if (first_guess)
	{
		words_by_score = [["raise", 5.11], ["irate", 5.08], ["arise", 5.06], ["arose", 4.97], ["saner", 4.96], ["null!", 3], ["puppy", 1.57], ["mamma", 1.56], ["vivid", 1.51], ["mummy", 1.50], ["fuzzy", 1.44]];
	}
	
	else
	{
		words_by_score = new Array(valid_solutions.length);
		
		//First, loop through all potential guesses.
		for (let i = 0; i < valid_solutions.length; i++)
		{
			let scores = new Array(grading_words.length);
			
			//A guess's score is determined by the percentage of remaining valid words it removes, so we first score a bunch of words.
			for (let j = 0; j < grading_words.length; j++)
			{
				scores[j] = score_word(valid_solutions[i], grading_words[j]);
			}
			
			//Now we'll take that score and go through the list of grading words, and see which ones would have given the same score.
			let num_preserved = 0;
			
			for (let j = 0; j < grading_words.length; j++)
			{
				for (let k = 0; k < grading_words.length; k++)
				{
					let equal = true;
					
					for (let l = 0; l < 5; l++)
					{
						if (scores[j][l] !== scores[k][l])
						{
							equal = false;
							break;
						}
					}
					
					if (equal)
					{
						num_preserved++;
					}
				}
			}
			
			words_by_score[i] = [valid_solutions[i], -Math.log(num_preserved / (grading_words.length * grading_words.length)) / Math.log(2)];
		}
	}
	
	
	
	//Now do the same for whatever the entry is.
	let scores = new Array(grading_words.length);
	
	for (let j = 0; j < grading_words.length; j++)
	{
		scores[j] = score_word(entry_string, grading_words[j]);
	}
	
	let num_preserved = 0;
	
	for (let j = 0; j < grading_words.length; j++)
	{
		for (let k = 0; k < grading_words.length; k++)
		{
			let equal = true;
			
			for (let l = 0; l < 5; l++)
			{
				if (scores[j][l] !== scores[k][l])
				{
					equal = false;
					break;
				}
			}
			
			if (equal)
			{
				num_preserved++;
			}
		}
	}
	
	let entry_score = -Math.log(num_preserved / (grading_words.length * grading_words.length)) / Math.log(2);
	
	
	
	//Now sort all the words by their score.
	words_by_score.sort((a, b) => a[1] - b[1]);
	
	
	
	let num_found = 0;
	
	let i = words_by_score.length - 1;
	
	let good_guesses = [];
	let bad_guesses = [];
	
	while (num_found < 5 && i >= 0)
	{
		if (valid_solutions.indexOf(words_by_score[i][0]) !== -1)
		{
			good_guesses.push(words_by_score[i]);
			
			num_found++;
		}
		
		i--;
	}
	
	if (i > 0)
	{
		num_found = 0;
		
		let j = 0;
		
		while (num_found < 5 && j < i)
		{
			if (valid_solutions.indexOf(words_by_score[j][0]) !== -1)
			{
				bad_guesses.push(words_by_score[j]);
				
				num_found++;
			}
			
			j++;
		}
	}
	
	
	
	//Now we bother with what actually happened.
	let score = score_word(entry_string, correct_solution);
	
	
	
	//Restrict valid solutions and valid guesses (if in hardmode) to a smaller set.
	for (let i = 0; i < valid_solutions.length; i++)
	{
		let score_2 = score_word(entry_string, valid_solutions[i]);
		
		let equal = true;
		
		for (let j = 0; j < 5; j++)
		{
			if (score[j] !== score_2[j])
			{
				equal = false;
				break;
			}
		}
		
		if (!equal)
		{
			valid_solutions.splice(i, 1);
			
			i--;
		}
	}
	
	if (hardmode)
	{
		for (let i = 0; i < valid_guesses.length; i++)
		{
			let score_2 = score_word(entry_string, valid_guesses[i]);
			
			let equal = true;
			
			for (let j = 0; j < 5; j++)
			{
				if (score[j] !== score_2[j])
				{
					equal = false;
					break;
				}
			}
			
			if (!equal)
			{
				valid_guesses.splice(i, 1);
				
				i--;
			}
		}
	}
	
	
	
	first_guess = false;
	
	postMessage([entry_score, score, good_guesses, bad_guesses]);
}



function score_word(guess, solution)
{
	let score = [0, 0, 0, 0, 0];
	
	let mutable_solution = solution.split("");
	
	for (let i = 0; i < 5; i++)
	{
		if (guess[i] === mutable_solution[i])
		{
			score[i] = 2;
			
			mutable_solution[i] = "_";
		}
	}
	
	for (let i = 0; i < 5; i++)
	{
		if (guess[i] !== mutable_solution[i])
		{
			for (let j = 0; j < 5; j++)
			{
				if (j === i)
				{
					continue;
				}
				
				if (guess[i] === mutable_solution[j])
				{
					score[i] = 1;
					
					mutable_solution[j] = "_";
					
					break;
				}
			}
		}
	}
	
	return score;
}