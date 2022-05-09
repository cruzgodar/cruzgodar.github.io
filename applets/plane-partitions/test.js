let lambda = [1];

let dim = 10;



let plane_partition = new Array(dim);

let plane_partition_hooks = new Array(2 * dim);

for (let i = 0; i < 2 * dim; i++)
{
	plane_partition_hooks[i] = [];
}

for (let i = 0; i < dim; i++)
{
	plane_partition[i] = new Array(dim);
	
	for (let j = 0; j < dim; j++)
	{
		plane_partition[i][j] = [(i + j + 1) % 2, (i + j) % 2];
		
		plane_partition_hooks[i + j + 1].push([i, j]);
	}
}



let app = new Array(dim);

let app_hooks = new Array(2 * dim);

for (let i = 0; i < 2 * dim; i++)
{
	app_hooks[i] = [];
}

for (let i = 0; i < dim; i++)
{
	app[i] = new Array(dim);
	
	for (let j = 0; j < dim; j++)
	{
		if (i < lambda.length && j < lambda[i])
		{
			continue;
		}
			
		app[i][j] = [(i + j + 1) % 2, (i + j) % 2];
		
		let hook_length = i + j + 1;
		
		if (i < lambda.length)
		{
			hook_length -= lambda[i];
		}
		
		if (j < lambda[0])
		{
			for (let k = 0; k < lambda.length; k++)
			{
				if (j < lambda[k])
				{
					hook_length--;
				}
				
				else
				{
					break;
				}
			}
		}
		
		app_hooks[hook_length].push([i, j]);
	}
}



app_hooks.forEach((hooks, hook_length) =>
{
	hooks.forEach((hook, index) =>
	{
		
	});
});