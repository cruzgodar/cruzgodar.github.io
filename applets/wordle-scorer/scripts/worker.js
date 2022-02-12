"use strict";



onmessage = async function(e)
{
	num_words_to_evaluate = e.data[1];
	
	if (hardmode === null)
	{
		hardmode = e.data[2];
	}
	
	grade_submission(e.data[0]);
}



let correct_solution = "ulcer";

let num_words_to_evaluate = 300;

let hardmode = null;

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
	if (valid_guesses.indexOf(entry_string) === -1)
	{
		postMessage([-1]);
		
		return;
	}
	
	
	
	//First, select some words from the set of current possibilities for grading.
	let grading_words = new Array(Math.min(num_words_to_evaluate, valid_solutions.length));
	
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
	
	
	
	let words_by_score = new Array(valid_guesses.length);
	
	//First, loop through all potential guesses.
	for (let i = 0; i < valid_guesses.length; i++)
	{
		let scores = new Array(grading_words.length);
		
		//A guess's score is determined by the percentage of remaining valid words it removes, so we first score a bunch of words.
		for (let j = 0; j < grading_words.length; j++)
		{
			scores[j] = score_word(valid_guesses[i], grading_words[j]);
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
		
		words_by_score[i] = [valid_guesses[i], -Math.log(num_preserved / (grading_words.length * grading_words.length)) / Math.log(2)];
	}
	
	
	
	//Now sort all the words by their score.
	words_by_score.sort((a, b) => a[1] - b[1]);
	
	let entry_score = 0;
	
	if (words_by_score.length > 1)
	{
		//Find the entry in the word list.
		for (let i = 0; i < words_by_score.length; i++)
		{
			if (words_by_score[i][0] === entry_string)
			{
				entry_score = words_by_score[i][1];
				
				break;
			}
		}
	}
	
	
	
	let num_found = 0;
	
	let i = words_by_score.length - 1;
	
	let notable_guesses = [];
	
	while (num_found < 3 && i >= 0)
	{
		if (valid_solutions.indexOf(words_by_score[i][0]) !== -1)
		{
			notable_guesses.push(words_by_score[i]);
			
			num_found++;
		}
		
		i--;
	}
	
	if (i > 0)
	{
		num_found = 0;
		
		let j = 0;
		
		while (num_found < 3 && j < i)
		{
			if (valid_solutions.indexOf(words_by_score[j][0]) !== -1)
			{
				notable_guesses.push(words_by_score[j]);
				
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
	
	
	
	postMessage([entry_score, score, notable_guesses]);
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