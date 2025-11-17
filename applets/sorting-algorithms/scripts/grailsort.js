/* eslint-disable max-len */
const Subarray = {
	LEFT : 1,
	RIGHT: 2,
};


class GrailComparator {
	constructor() {}
	compare(leftPair, rightPair) {
		console.log(leftPair, rightPair);
		if      (leftPair < rightPair) {return -1;}
		else if (leftPair > rightPair) {return  1;}
		else                           {return  0;}
	}
}

// REWRITTEN GRAILSORT FOR JAVASCRIPT - A heavily refactored C/C++-to-JavaScript version of
//                                      Andrey Astrelin's GrailSort.h, aiming to be as
//                                      readable and intuitive as possible.
//
// ** Written and maintained by The Holy Grail Sort Project
//
// Primary author: Enver
//
// Current status: Finished. Potentially 100% working... Passing most tests, some tests capped by V8 Engine memory allocation limits

export class GrailSort {
	static GRAIL_STATIC_EXT_BUF_LEN = 512;
    
	constructor(readFromPosition, writeToPosition) {
		this.readFromPosition = readFromPosition;
		this.writeToPosition = writeToPosition;

		this.grailComp = new GrailComparator();

		this.externalBuffer;
		this.externalBufferLen;
        
		this.currentBlockLen;
		this.currentBlockOrigin;
	}
    
	* grailSwap(array, a, b) {
		const temp = array[a];
		array[a] = array[b];
		array[b] = temp;

		if (this.writeToPosition(a)) {yield;}
		if (this.writeToPosition(b)) {yield;}
	}
    
	* grailBlockSwap(array, a, b, blockLen) {
		for(let i = 0; i < blockLen; i++) {
			yield* this.grailSwap(array, a + i, b + i);
		}
	}

	toAbsoluteIndex(index, length)
	{
		return index < 0 ? Math.max(index + length, 0) : Math.min(index, length);
	}

	* copyWithin(array, target, start, end)
	{
		const len = array.length;
		let to = this.toAbsoluteIndex(target, len);
		let from = this.toAbsoluteIndex(start, len);
		let count = Math.min((end === undefined ? len : this.toAbsoluteIndex(end, len)) - from, len - to);
		let inc = 1;
		if (from < to && to < from + count)
		{
			inc = -1;
			from += count - 1;
			to += count - 1;
		}
		while (count-- > 0)
		{
			if (from in array)
			{
				array[to] = array[from];
				if (this.writeToPosition(to)) {yield;}
			}
			to += inc;
			from += inc;
		}
		return array;
	}

	// Object src, int srcPos, Object dest, int destPos, int length
	// Custom method for copying parts of the array either:
	//      within itself to a different destination, or
	//      to another array
	* arraycopy(srcArray, srcPos, destArray, destPos, copyLen) {
		if (srcArray === destArray) {
			this.copyWithin(srcArray, destPos, srcPos, srcPos + copyLen);
		} else {
			// FIXED INCORRECT MEMBER NAME BUG 'srcArray.copyLen': should be -> srcArray.length
			if (srcPos === 0 && copyLen === srcArray.length) {
				destArray = srcArray.slice();
			} else {
				for (let i = 0; i < copyLen; i++) {
					if (this.writeToPosition(destPos + i)) {yield;}
					destArray[destPos + i] = srcArray[srcPos + i];
				}
			}
		}
	}
    
	grailRotate(array, start, leftLen, rightLen) {
		while(leftLen > 0 && rightLen > 0) {
			if(leftLen <= rightLen) {
				this.grailBlockSwap(array, start, start + leftLen, leftLen);
				start += leftLen;
				rightLen -= leftLen;
			}
			else {
				this.grailBlockSwap(array, start + leftLen - rightLen, start + leftLen, rightLen);
				leftLen -= rightLen;
			}
		}
	}
    
	// Variant of Insertion Sort that utilizes swaps instead of overwrites.
	// Also known as "Optimized Gnomesort".
	* grailInsertSort(array, start, length) {
		for(let item = 1; item < length; item++) {
			let left  = start + item - 1;
			let right = start + item;
            
			this.readFromPosition(left);
			this.readFromPosition(right);

			while(left >= start && this.grailComp.compare(array[ left],
				array[right]) > 0) {
				yield* this.grailSwap(array, left, right);
				left--;
				right--;
			}
		}
	}

	* grailBinarySearchLeft(array, start, length, target) {
		let left  = 0;
		let right = length;
		while(left < right) {
			const middle = left + parseInt((right - left) / 2);
			if(this.grailComp.compare(array[start + middle], target) < 0) {
				left = middle + 1;
			}
			else {
				right = middle;
			}
		}
		return left;
	}
	// Credit to Anonymous0726 for debugging
	* grailBinarySearchRight(array, start, length, target) {
		let left  = 0;
		let right = length;
		while(left < right) {
			const middle = left + parseInt((right - left) / 2);
			if(this.grailComp.compare(array[start + middle], target) > 0) {
				right = middle;
			}
			else {
				left = middle + 1;
			}
		}
		// OFF-BY-ONE BUG FIXED: used to be `return right - 1;`
		return right;
	}
    
	// cost: 2 * length + idealKeys^2 / 2
	* grailCollectKeys(array, start, length, idealKeys) {
		let keysFound  = 1; // by itself, the first item in the array is our first unique key
		let firstKey   = 0; // the first item in the array is at the first position in the array
		let currentKey = 1; // the index used for finding potentially unique items ("keys") in the array
        
		while(currentKey < length && keysFound < idealKeys) {
            
			// Find the location in the key-buffer where our current key can be inserted in sorted order.
			// If the key at insertPos is equal to currentKey, then currentKey isn't unique and we move on.
			const insertPos = yield* this.grailBinarySearchLeft(array, start + firstKey, keysFound, array[start + currentKey]);
            
			// The second part of this conditional does the equal check we were just talking about; however,
			// if currentKey is larger than everything in the key-buffer (meaning insertPos == keysFound),
			// then that also tells us it wasn't *equal* to anything in the key-buffer. Magic! :)
			if(insertPos == keysFound || this.grailComp.compare(array[start + currentKey            ],
				array[start +   firstKey + insertPos]) != 0) {
                
				// First, rotate the key-buffer over to currentKey's immediate left...
				// (this helps save a TON of swaps/writes!!!)
				yield* this.grailRotate(array, start + firstKey, keysFound, currentKey - (firstKey + keysFound));
                
				// Update the new position of firstKey...
				firstKey = currentKey - keysFound;
                
				// Then, "insertion sort" currentKey to its spot in the key-buffer!
				yield* this.grailRotate(array, start + firstKey + insertPos, keysFound - insertPos, 1);
                
				// One step closer to idealKeys.
				keysFound++;
			}
			// Move on and test the next key...
			currentKey++;
		}
        
		// Bring however many keys we found back to the beginning of our array,
		// and return the number of keys collected.
		yield* this.grailRotate(array, start, firstKey, keysFound);
		return keysFound;
	}
    
	grailPairwiseSwaps(array, start, length) {
		let index;
		for(index = 1; index < length; index += 2) {
			const  left = start + index - 1;
			const right = start + index;

			if(this.grailComp.compare(array[left], array[right]) > 0) {
				this.grailSwap(array,  left - 2, right);
				this.grailSwap(array, right - 2,  left);
			}
			else {
				this.grailSwap(array,  left - 2,  left);
				this.grailSwap(array, right - 2, right);
			}
		}
        
		const left = start + index - 1;
		if(left < start + length) {
			this.grailSwap(array, left - 2, left);
		}
	}
	grailPairwiseWrites(array, start, length) {
		let index;
		for(index = 1; index < length; index += 2) {
			const  left = start + index - 1;
			const right = start + index;

			if(this.grailComp.compare(array[left], array[right]) > 0) {
				array[ left - 2] = array[right];
				array[right - 2] = array[ left];
			}
			else {
				array[ left - 2] = array[ left];
				array[right - 2] = array[right];
			}
		}
        
		const left = start + index - 1;
		if(left < start + length) {
			array[left - 2] = array[left];
		}
	}
    
	// array[buffer .. start - 1] <=> "scrolling buffer"
	//
	// "scrolling buffer" + array[start, middle - 1] + array[middle, end - 1]
	// --> array[buffer, buffer + end - 1] + "scrolling buffer"
	grailMergeForwards(array, start, leftLen, rightLen, bufferOffset) {
		let   left = start;
		const middle = start  +  leftLen;
		let  right = middle;
		const    end = middle + rightLen;
		let buffer = start  - bufferOffset;
        
		while(right < end) {
			if(left == middle || this.grailComp.compare(array[ left],
				array[right]) > 0) {
                
				this.grailSwap(array, buffer, right);
				right++;
			}
			else {
				this.grailSwap(array, buffer,  left);
				left++;
			}
			buffer++;
		}
        
		if(buffer != left) {
			this.grailBlockSwap(array, buffer, left, middle - left);
		}
	}

	// credit to 666666t for thorough bug-checking/fixing
	grailMergeBackwards(array, start, leftLen, rightLen, bufferOffset) {
		let   left = start  +  leftLen - 1;
		const middle = left;
		// OFF-BY-ONE BUG FIXED: used to be `let  right = middle + rightLen - 1;`
		let  right = middle + rightLen;
		const    end = start;
		// OFF-BY-ONE BUG FIXED: used to be `let buffer = right  + bufferOffset - 1;`
		let buffer = right  + bufferOffset;
        
		while(left >= end) {
			if(right == middle || this.grailComp.compare(array[ left],
				array[right]) > 0) {
                
				this.grailSwap(array, buffer,  left);
				left--;
			}
			else {
				this.grailSwap(array, buffer, right);
				right--;
			}
			buffer--;
		}
        
		if(right != buffer) {
			while(right > middle) {
				this.grailSwap(array, buffer, right);
				buffer--;
				right--;
			}
		}
	}

	// array[buffer .. start - 1] <=> "free space"
	//
	// "free space" + array[start, middle - 1] + array[middle, end - 1]
	// --> array[buffer, buffer + end - 1] + "free space"
	//
	// FUNCTION RENAMED: More consistent with "out-of-place" being at the end
	grailMergeOutOfPlace(array, start, leftLen, rightLen, bufferOffset) {
		let   left = start;
		const middle = start  +  leftLen;
		let  right = middle;
		const    end = middle + rightLen;
		let buffer = start  - bufferOffset;
        
		while(right < end) {
			if(left == middle || this.grailComp.compare(array[ left],
				array[right]) > 0) {
                
				array[buffer] = array[right];
				right++;
			}
			else {
				array[buffer] = array[ left];
				left++;
			}
			buffer++;
		}
        
		if(buffer != left) {
			while(left < middle) {
				array[buffer] = array[left];
				buffer++;
				left++;
			}
		}
	}

	grailBuildInPlace(array, start, length, currentMerge, bufferLen) {
		for(let mergeLen = currentMerge; mergeLen < bufferLen; mergeLen *= 2) {
			let mergeIndex;
			const mergeEnd = start + length - (2 * mergeLen);
			const bufferOffset = mergeLen;
    
			for(mergeIndex = start; mergeIndex <= mergeEnd; mergeIndex += (2 * mergeLen)) {
				this.grailMergeForwards(array, mergeIndex, mergeLen, mergeLen, bufferOffset);
			}
    
			const leftOver = length - (mergeIndex - start);
    
			if(leftOver > mergeLen) {
				this.grailMergeForwards(array, mergeIndex, mergeLen, leftOver - mergeLen, bufferOffset);
			}
			else {
				this.grailRotate(array, mergeIndex - mergeLen, mergeLen, leftOver);
			}
    
			start -= mergeLen;
		}
    
		const finalBlock  = length % (2 * bufferLen);
		const finalOffset = start + length - finalBlock;
    
		if(finalBlock <= bufferLen) {
			this.grailRotate(array, finalOffset, finalBlock, bufferLen);
		}
		else {
			this.grailMergeBackwards(array, finalOffset, bufferLen, finalBlock - bufferLen, bufferLen);
		}
    
		for(let mergeIndex = finalOffset - (2 * bufferLen); mergeIndex >= start; mergeIndex -= (2 * bufferLen)) {
			this.grailMergeBackwards(array, mergeIndex, bufferLen, bufferLen, bufferLen);
		}
	}

	grailBuildOutOfPlace(array, start, length, bufferLen, externLen) {
		this.arraycopy(array, start - externLen, this.externalBuffer, 0, externLen);
        
		this.grailPairwiseWrites(array, start, length);
		start -= 2;
        
		let mergeLen;
		for(mergeLen = 2; mergeLen < externLen; mergeLen *= 2) {
			let mergeIndex;
			const mergeEnd = start + length - (2 * mergeLen);
			const bufferOffset = mergeLen;
    
			for(mergeIndex = start; mergeIndex <= mergeEnd; mergeIndex += (2 * mergeLen)) {
				this.grailMergeOutOfPlace(array, mergeIndex, mergeLen, mergeLen, bufferOffset);
			}
    
			const leftOver = length - (mergeIndex - start);
    
			if(leftOver > mergeLen) {
				this.grailMergeOutOfPlace(array, mergeIndex, mergeLen, leftOver - mergeLen, bufferOffset);
			}
			else {
				// TODO: Is this correct??
				for(let offset = 0; offset < leftOver; offset++) {
					array[mergeIndex + offset - mergeLen] = array[mergeIndex + offset];
				}
			}
    
			start -= mergeLen;
		}
        
		this.arraycopy(this.externalBuffer, 0, array, start + length, externLen);
		this.grailBuildInPlace(array, start, length, mergeLen, bufferLen);
	}

	// build blocks of length 'bufferLen'
	// input: [start - mergeLen, start - 1] elements are buffer
	// output: first 'bufferLen' elements are buffer, blocks (2 * bufferLen) and last subblock sorted
	grailBuildBlocks(array, start, length, bufferLen) {
		if(this.externalBuffer != null) {
			let externLen;
            
			if(bufferLen < this.externalBufferLen) {
				externLen = bufferLen;
			}
			else {
				// max power of 2 -- just in case
				externLen = 1;
				while((externLen * 2) <= this.externalBufferLen) {
					externLen *= 2;
				}
			}
            
			this.grailBuildOutOfPlace(array, start, length, bufferLen, externLen);
		}
		else {
			this.grailPairwiseSwaps(array, start, length);
			this.grailBuildInPlace(array, start - 2, length, 2, bufferLen);
		}
	}

	// Returns the final position of 'medianKey'.
	grailBlockSelectSort(array, keys, start, medianKey, blockCount, blockLen) {
		for(let block = 1; block < blockCount; block++) {
			const  left = block - 1;
			let right = left;

			for(let index = block; index < blockCount; index++) {
				const compare = this.grailComp.compare(array[start + (right * blockLen)],
					array[start + (index * blockLen)]);

				if(compare > 0 || (compare == 0 && this.grailComp.compare(array[keys + right],
					array[keys + index]) > 0)) {
					right = index;
				}
			}

			if(right != left) {
				// Swap the left and right selected blocks...
				this.grailBlockSwap(array, start + (left * blockLen), start + (right * blockLen), blockLen);

				// Swap the keys...
				this.grailSwap(array, keys + left, keys + right);

				// ...and follow the 'medianKey' if it was swapped

				// ORIGINAL LOC: if(midkey==u-1 || midkey==p) midkey^=(u-1)^p;
				// MASSIVE, MASSIVE credit to lovebuny for figuring this one out!
				if(medianKey == left) {
					medianKey = right;
				}
				else if(medianKey == right) {
					medianKey = left;
				}
			}
		}

		return medianKey;
	}
    
	// Swaps Grailsort's "scrolling buffer" from the right side of the array all the way back to 'start'.
	// Costs O(n) operations.
	//
	// OFF-BY-ONE BUG FIXED: used to be `int index = start + resetLen`; credit to 666666t for debugging
	grailInPlaceBufferReset(array, start, resetLen, bufferLen) {
		for(let index = start + resetLen - 1; index >= start; index--) {
			this.grailSwap(array, index, index - bufferLen);
		}
	}
    
	// Shifts entire array over 'bufferSize' spaces to make room for the out-of-place merging buffer.
	// Costs O(n) operations.
	//
	// OFF-BY-ONE BUG FIXED: used to be `int index = start + resetLen`; credit to 666666t for debugging
	grailOutOfPlaceBufferReset(array, start, resetLen, bufferLen) {
		for(let index = start + resetLen - 1; index >= start; index--) {
			array[index] = array[index - bufferLen];
		}
	}
    
	// Rewinds Grailsort's "scrolling buffer" such that any items from a left subarray block left over by a "smart merge" are moved to
	// the right of the buffer. This is used to maintain stability and to continue an ongoing merge that has run out of buffer space.
	// Costs O(sqrt n) swaps in the *absolute* worst-case.
	//
	// NAMING IMPROVED: the left over items are in the middle of the merge while the buffer is at the end
	grailInPlaceBufferRewind(array, start, leftOvers, buffer) {
		while(leftOvers > start) {
			leftOvers--;
			buffer--;
			this.grailSwap(array, buffer, leftOvers);
		}
	}
    
	// Rewinds Grailsort's out-of-place buffer such that any items from a left subarray block left over by a "smart merge" are moved to
	// the right of the buffer. This is used to maintain stability and to continue an ongoing merge that has run out of buffer space.
	// Costs O(sqrt n) writes in the *absolute* worst-case.
	//
	// INCORRECT ORDER OF PARAMETERS BUG FIXED: `leftOvers` should be the middle, and `buffer` should be the end
	grailOutOfPlaceBufferRewind(array, start, leftOvers, buffer) {
		while(leftOvers > start) {
			leftOvers--;
			buffer--;
			array[buffer] = array[leftOvers];
		}
	}
    
	grailGetSubarray(array, currentKey, medianKey) {
		if(this.grailComp.compare(array[currentKey], array[medianKey]) < 0) {
			return Subarray.LEFT;
		}
		else {
			return Subarray.RIGHT;
		}
	}

	// FUNCTION RENAMED: more clear *which* left blocks are being counted
	grailCountFinalLeftBlocks(array, offset, blockCount, blockLen) {
		let leftBlocks = 0;
        
		const firstRightBlock = offset + (blockCount * blockLen);
		let prevLeftBlock   = firstRightBlock - blockLen;
        
		while(leftBlocks < blockCount && this.grailComp.compare(array[firstRightBlock],
			array[  prevLeftBlock]) < 0) {
			leftBlocks++;
			prevLeftBlock -= blockLen;
		}
        
		return leftBlocks;
	}
    
	grailSmartMerge(array, start, leftLen, leftOrigin, rightLen, bufferOffset) {
		let   left = start;
		const middle = start  +  leftLen;
		let  right = middle;
		const    end = middle + rightLen;
		let buffer = start  - bufferOffset;
        
		if(leftOrigin == Subarray.LEFT) {
			while(left < middle && right < end) {
				if(this.grailComp.compare(array[left], array[right]) <= 0) {
					this.grailSwap(array, buffer, left);
					left++;
				}
				else {
					this.grailSwap(array, buffer, right);
					right++;
				}
				buffer++;
			}
		}
		else {
			while(left < middle && right < end) {
				if(this.grailComp.compare(array[left], array[right]) <  0) {
					this.grailSwap(array, buffer, left);
					left++;
				}
				else {
					this.grailSwap(array, buffer, right);
					right++;
				}
				buffer++;
			}
		}
        
		if(left < middle) {
			this.currentBlockLen = middle - left;
			this.grailInPlaceBufferRewind(array, left, middle, end);
		}
		else {
			this.currentBlockLen = end - right;
			if(leftOrigin == Subarray.LEFT) {
				this.currentBlockOrigin = Subarray.RIGHT;
			}
			else {
				this.currentBlockOrigin = Subarray.LEFT;
			}
		}
	}

	grailSmartLazyMerge(array, start, leftLen, leftOrigin, rightLen) {
		if(leftOrigin == Subarray.LEFT) {
			if(this.grailComp.compare(array[start + leftLen - 1], array[start + leftLen]) >  0) {
				while(leftLen != 0) {
					const insertPos = this.grailBinarySearchLeft(array, start + leftLen, rightLen, array[start]);
                    
					if(insertPos != 0) {
						this.grailRotate(array, start, leftLen, insertPos);
						start    += insertPos;
						rightLen -= insertPos;
					}
                    
					if(rightLen == 0) {
						this.currentBlockLen = leftLen;
						return;
					}
					else {
						do {
							start++;
							leftLen--;
						} while(leftLen != 0 && this.grailComp.compare(array[start          ],
							array[start + leftLen]) <= 0);
					}
				}
			}
		}
		else {
			if(this.grailComp.compare(array[start + leftLen - 1], array[start + leftLen]) >= 0) {
				while(leftLen != 0) {
					const insertPos = this.grailBinarySearchRight(array, start + leftLen, rightLen, array[start]);
                    
					if(insertPos != 0) {
						this.grailRotate(array, start, leftLen, insertPos);
						start    += insertPos;
						rightLen -= insertPos;
					}
                    
					if(rightLen == 0) {
						this.currentBlockLen = leftLen;
						return;
					}
					else {
						do {
							start++;
							leftLen--;
						} while(leftLen != 0 && this.grailComp.compare(array[start          ],
							array[start + leftLen]) < 0);
					}
				}
			}
		}
        
		this.currentBlockLen = rightLen;
		if(leftOrigin == Subarray.LEFT) {
			this.currentBlockOrigin = Subarray.RIGHT;
		}
		else {
			this.currentBlockOrigin = Subarray.LEFT;
		}
	}

	// FUNCTION RENAMED: more consistent with other "out-of-place" merges
	grailSmartMergeOutOfPlace(array, start, leftLen, leftOrigin, rightLen, bufferOffset) {
		let   left = start;
		const middle = start  +  leftLen;
		let  right = middle;
		const    end = middle + rightLen;
		let buffer = start  - bufferOffset;
        
		if(leftOrigin == Subarray.LEFT) {
			while(left < middle && right < end) {
				if(this.grailComp.compare(array[left], array[right]) <= 0) {
					array[buffer] = array[left];
					left++;
				}
				else {
					array[buffer] = array[right];
					right++;
				}
				buffer++;
			}
		}
		else {
			while(left < middle && right < end) {
				if(this.grailComp.compare(array[left], array[right]) <  0) {
					array[buffer] = array[left];
					left++;
				}
				else {
					array[buffer] = array[right];
					right++;
				}
				buffer++;
			}
		}
        
		if(left < middle) {
			this.currentBlockLen = middle - left;
			this.grailOutOfPlaceBufferRewind(array, left, middle, end);
		}
		else {
			this.currentBlockLen = end - right;
			if(leftOrigin == Subarray.LEFT) {
				this.currentBlockOrigin = Subarray.RIGHT;
			}
			else {
				this.currentBlockOrigin = Subarray.LEFT;
			}
		}
	}

	grailMergeBlocks(array, keys, medianKey, start, blockCount, blockLen, finalLeftBlocks, finalLen) {
		let currentBlock;
		let blockIndex = blockLen;
        
		this.currentBlockLen    = blockLen;
		this.currentBlockOrigin = this.grailGetSubarray(array, keys, medianKey);
        
		for(let keyIndex = 1; keyIndex < blockCount; keyIndex++, blockIndex += blockLen) {
			currentBlock = blockIndex - this.currentBlockLen;
            
			const nextBlockOrigin = this.grailGetSubarray(array, keys + keyIndex, medianKey);
            
			if(nextBlockOrigin == this.currentBlockOrigin) {
				this.grailBlockSwap(array, start + currentBlock - blockLen, start + currentBlock, this.currentBlockLen);
				currentBlock = blockIndex;
                
				this.currentBlockLen = blockLen;
			}
			else {
				this.grailSmartMerge(array, start + currentBlock, this.currentBlockLen, this.currentBlockOrigin, blockLen, blockLen);
			}
		}
        
		currentBlock = blockIndex - this.currentBlockLen;
        
		if(finalLen != 0) {
			if(this.currentBlockOrigin == Subarray.RIGHT) {
				this.grailBlockSwap(array, start + currentBlock - blockLen, start + currentBlock, this.currentBlockLen);
				currentBlock = blockIndex;
                
				this.currentBlockLen    = blockLen * finalLeftBlocks;
				this.currentBlockOrigin = Subarray.LEFT;
			}
			else {
				this.currentBlockLen += blockLen * finalLeftBlocks;
			}
            
			this.grailMergeForwards(array, start + currentBlock, this.currentBlockLen, finalLen, blockLen);
		}
		else {
			this.grailBlockSwap(array, start + currentBlock, start + currentBlock - blockLen, this.currentBlockLen);
		}
	}

	grailLazyMergeBlocks(array, keys, medianKey, start, blockCount, blockLen, finalLeftBlocks, finalLen) {
		let currentBlock;
		let blockIndex = blockLen;
        
		this.currentBlockLen    = blockLen;
		this.currentBlockOrigin = this.grailGetSubarray(array, keys, medianKey);
        
		for(let keyIndex = 1; keyIndex < blockCount; keyIndex++, blockIndex += blockLen) {
			currentBlock = blockIndex - this.currentBlockLen;
            
			const nextBlockOrigin = this.grailGetSubarray(array, keys + keyIndex, medianKey);
            
			if(nextBlockOrigin == this.currentBlockOrigin) {
				currentBlock = blockIndex;
                
				this.currentBlockLen = blockLen;
			}
			else {
				// These checks were included in the original code... but why???
				if(blockLen != 0 && this.currentBlockLen != 0) {
					this.grailSmartLazyMerge(array, start + currentBlock, this.currentBlockLen, this.currentBlockOrigin, blockLen);
				}
			}
		}
        
		currentBlock = blockIndex - this.currentBlockLen;
        
		if(finalLen != 0) {
			if(this.currentBlockOrigin == Subarray.RIGHT) {
				currentBlock = blockIndex;
                
				this.currentBlockLen    = blockLen * finalLeftBlocks;
				this.currentBlockOrigin = Subarray.LEFT;
			}
			else {
				this.currentBlockLen += blockLen * finalLeftBlocks;
			}
            
			this.grailLazyMerge(array, start + currentBlock, this.currentBlockLen, finalLen);
		}
	}

	grailMergeBlocksOutOfPlace(array, keys, medianKey, start, blockCount, blockLen, finalLeftBlocks, finalLen) {
		let currentBlock;
		let blockIndex = blockLen;
        
		this.currentBlockLen    = blockLen;
		this.currentBlockOrigin = this.grailGetSubarray(array, keys, medianKey);
        
		for(let keyIndex = 1; keyIndex < blockCount; keyIndex++, blockIndex += blockLen) {
			currentBlock = blockIndex - this.currentBlockLen;
            
			const nextBlockOrigin = this.grailGetSubarray(array, keys + keyIndex, medianKey);
            
			if(nextBlockOrigin == this.currentBlockOrigin) {
				this.arraycopy(array, start + currentBlock, array, start + currentBlock - blockLen, this.currentBlockLen);
				currentBlock = blockIndex;
                
				this.currentBlockLen = blockLen;
			}
			else {
				this.grailSmartMergeOutOfPlace(array, start + currentBlock, this.currentBlockLen, this.currentBlockOrigin, blockLen, blockLen);
			}
		}
        
		currentBlock = blockIndex - this.currentBlockLen;
        
		if(finalLen != 0) {
			if(this.currentBlockOrigin == Subarray.RIGHT) {
				this.arraycopy(array, start + currentBlock, array, start + currentBlock - blockLen, this.currentBlockLen);
				currentBlock = blockIndex;
                
				this.currentBlockLen    = blockLen * finalLeftBlocks;
				this.currentBlockOrigin = Subarray.LEFT;
			}
			else {
				this.currentBlockLen += blockLen * finalLeftBlocks;
			}
            
			this.grailMergeOutOfPlace(array, start + currentBlock, this.currentBlockLen, finalLen, blockLen);
		}
		else {
			this.arraycopy(array, start + currentBlock, array, start + currentBlock - blockLen, this.currentBlockLen);
		}
	}

	// TODO: Double-check "Merge Blocks" arguments
	grailCombineInPlace(array, keys, start, length, subarrayLen, blockLen, mergeCount, lastSubarray, buffer) {
		for(let mergeIndex = 0; mergeIndex < mergeCount; mergeIndex++) {
			const offset = start + (mergeIndex * (2 * subarrayLen));
			const blockCount = parseInt((2 * subarrayLen) / blockLen);
            
			this.grailInsertSort(array, keys, blockCount);
    
			// INCORRECT PARAMETER BUG FIXED: `block select sort` should be using `offset`, not `start`
			let medianKey = parseInt(subarrayLen / blockLen);
			medianKey = this.grailBlockSelectSort(array, keys, offset, medianKey, blockCount, blockLen);
            
			if(buffer) {
				this.grailMergeBlocks(array, keys, keys + medianKey, offset, blockCount, blockLen, 0, 0);
			}
			else {
				this.grailLazyMergeBlocks(array, keys, keys + medianKey, offset, blockCount, blockLen, 0, 0);
			}
		}
    
		// INCORRECT CONDITIONAL/PARAMETER BUG FIXED: Credit to 666666t for debugging.
		if(lastSubarray != 0) {
			const offset = start + (mergeCount * (2 * subarrayLen));
			const rightBlocks = parseInt(lastSubarray / blockLen);
            
			this.grailInsertSort(array, keys, rightBlocks + 1);
            
			// INCORRECT PARAMETER BUG FIXED: `block select sort` should be using `offset`, not `start`
			let medianKey = parseInt(subarrayLen / blockLen);
			medianKey = this.grailBlockSelectSort(array, keys, offset, medianKey, rightBlocks, blockLen);
    
			// MISSING BOUNDS CHECK BUG FIXED: `lastFragment` *can* be 0 if the `lastSubarray` is evenly
			//                                 divided into blocks. This prevents Grailsort from going
			//                                 out of bounds.
			const lastFragment = lastSubarray % blockLen;
			let leftBlocks;
			if(lastFragment != 0) {
				leftBlocks = this.grailCountFinalLeftBlocks(array, offset, rightBlocks, blockLen);
			}
			else {
				leftBlocks = 0;
			}
    
			const blockCount = rightBlocks - leftBlocks;
            
			// TODO: Double-check if this micro-optimization works correctly like the original
			if(blockCount == 0) {
				const leftLength = leftBlocks * blockLen;
                
				// INCORRECT PARAMETER BUG FIXED: these merges should be using `offset`, not `start`
				if(buffer) {
					this.grailMergeForwards(array, offset, leftLength, lastFragment, blockLen);
				}
				else {
					this.grailLazyMerge(array, offset, leftLength, lastFragment);
				}
			}
			else {
				if(buffer) {
					this.grailMergeBlocks(array, keys, keys + medianKey, offset, blockCount, blockLen, leftBlocks, lastFragment);
				}
				else {
					this.grailLazyMergeBlocks(array, keys, keys + medianKey, offset, blockCount, blockLen, leftBlocks, lastFragment);
				}
			}
		}
    
		if(buffer) {
			this.grailInPlaceBufferReset(array, start, length, blockLen);
		}
	}

	grailCombineOutOfPlace(array, keys, start, length, subarrayLen, blockLen, mergeCount, lastSubarray) {
		this.arraycopy(array, start - blockLen, this.externalBuffer, 0, blockLen);

		for(let mergeIndex = 0; mergeIndex < mergeCount; mergeIndex++) {
			const offset = start + (mergeIndex * (2 * subarrayLen));
			const blockCount = parseInt((2 * subarrayLen) / blockLen);
            
			this.grailInsertSort(array, keys, blockCount);

			// INCORRECT PARAMETER BUG FIXED: `block select sort` should be using `offset`, not `start`
			let medianKey = parseInt(subarrayLen / blockLen);
			medianKey = this.grailBlockSelectSort(array, keys, offset, medianKey, blockCount, blockLen);
            
			this.grailMergeBlocksOutOfPlace(array, keys, keys + medianKey, offset, blockCount, blockLen, 0, 0);
		}

		// INCORRECT CONDITIONAL/PARAMETER BUG FIXED: Credit to 666666t for debugging.
		if(lastSubarray != 0) {
			const offset = start + (mergeCount * (2 * subarrayLen));
			const rightBlocks = parseInt(lastSubarray / blockLen);
            
			this.grailInsertSort(array, keys, rightBlocks + 1);

			// INCORRECT PARAMETER BUG FIXED: `block select sort` should be using `offset`, not `start`
			let medianKey = subarrayLen / blockLen;
			medianKey = this.grailBlockSelectSort(array, keys, offset, medianKey, rightBlocks, blockLen);

			// MISSING BOUNDS CHECK BUG FIXED: `lastFragment` *can* be 0 if the `lastSubarray` is evenly
			//                                 divided into blocks. This prevents Grailsort from going
			//                                 out of bounds.
			const lastFragment = lastSubarray % blockLen;
			let leftBlocks;
			if(lastFragment != 0) {
				leftBlocks = this.grailCountFinalLeftBlocks(array, offset, rightBlocks, blockLen);
			}
			else {
				leftBlocks = 0;
			}
            
			const blockCount = rightBlocks - leftBlocks;
            
			if(blockCount == 0) {
				// INCORRECT PARAMETER BUG FIXED: this merge should be using `offset`, not `start`
				const leftLength = leftBlocks * blockLen;
				this.grailMergeOutOfPlace(array, offset, leftLength, lastFragment, blockLen);
			}
			else {
				this.grailMergeBlocksOutOfPlace(array, keys, keys + medianKey, offset, blockCount, blockLen, leftBlocks, lastFragment);
			}
		}

		this.grailOutOfPlaceBufferReset(array, start, length, blockLen);
		this.arraycopy(this.externalBuffer, 0, array, start - blockLen, blockLen);
	}

	// 'keys' are on the left side of array. Blocks of length 'subarrayLen' combined. We'll combine them in pairs
	// 'subarrayLen' is a power of 2. (2 * subarrayLen / blockLen) keys are guaranteed
	grailCombineBlocks(array, keys, start, length, subarrayLen, blockLen, buffer) {
		const   mergeCount = parseInt(length / (2 * subarrayLen));
		let lastSubarray = parseInt(length % (2 * subarrayLen));
    
		if(lastSubarray <= subarrayLen) {
			length -= lastSubarray;
			lastSubarray = 0;
		}
    
		// INCOMPLETE CONDITIONAL BUG FIXED: In order to combine blocks out-of-place, we must check if a full-sized
		//                                   block fits into our external buffer.
		if(buffer && blockLen <= this.externalBufferLen) {
			this.grailCombineOutOfPlace(array, keys, start, length, subarrayLen, blockLen, mergeCount, lastSubarray);
		}
		else {
			this.grailCombineInPlace(array, keys, start, length, subarrayLen, blockLen, mergeCount, lastSubarray, buffer);
		}
	}

	// "Classic" in-place merge sort using binary searches and rotations
	//
	// cost: min(leftLen, rightLen)^2 + max(leftLen, rightLen)
	grailLazyMerge(array, start, leftLen, rightLen) {
		if(leftLen < rightLen) {
			while(leftLen != 0) {
				const insertPos = this.grailBinarySearchLeft(array, start + leftLen, rightLen, array[start]);

				if(insertPos != 0) {
					this.grailRotate(array, start, leftLen, insertPos);
					start    += insertPos;
					rightLen -= insertPos;
				}

				if(rightLen == 0) {
					break;
				}
				else {
					do {
						start++;
						leftLen--;
					} while(leftLen != 0 && this.grailComp.compare(array[start          ],
						array[start + leftLen]) <= 0);
				}
			}
		} else {
			let end = start + leftLen + rightLen - 1;
			while(rightLen != 0) {
				const insertPos = this.grailBinarySearchRight(array, start, leftLen, array[end]);

				if(insertPos != leftLen) {
					this.grailRotate(array, start + insertPos, leftLen - insertPos, rightLen);
					end    -= leftLen - insertPos;
					leftLen = insertPos;
				}

				if(leftLen == 0) {
					break;
				}
				else {
					const leftEnd = start + leftLen - 1;
					do {
						rightLen--;
						end--;
					} while(rightLen != 0 && this.grailComp.compare(array[leftEnd],
						array[    end]) <= 0);
				}
			}
		}
	}
    
	grailLazyStableSort(array, start, length) {
		for(let index = 1; index < length; index += 2) {
			const  left = start + index - 1;
			const right = start + index;
            
			if(this.grailComp.compare(array[left], array[right]) > 0) {
				this.grailSwap(array, left, right);
			}
		}
		for(let mergeLen = 2; mergeLen < length; mergeLen *= 2) {
			let mergeIndex;
			const mergeEnd = length - (2 * mergeLen);
            
			for(mergeIndex = 0; mergeIndex <= mergeEnd; mergeIndex += (2 * mergeLen)) {
				this.grailLazyMerge(array, start + mergeIndex, mergeLen, mergeLen);
			}
            
			const leftOver = length - mergeIndex;
			if(leftOver > mergeLen) {
				this.grailLazyMerge(array, start + mergeIndex, mergeLen, leftOver - mergeLen);
			}
		}
	}
    
	static calcMinKeys(numKeys, blockKeysSum) {
		let minKeys = 1;
		while(minKeys < numKeys && blockKeysSum != 0) {
			minKeys *= 2;
			blockKeysSum = parseInt(blockKeysSum / 8);
		}
		return minKeys;
	}
    
	* grailCommonSort(array, start, length, extBuf, extBufLen) {
		if(length < 16) {
			yield* this.grailInsertSort(array, start, length);
			return;
		}
		else {
			let blockLen = 1;

			// find the smallest power of two greater than or equal to
			// the square root of the input's length
			while((blockLen * blockLen) < length) {
				blockLen *= 2;
			}

			// '((a - 1) / b) + 1' is actually a clever and very efficient
			// formula for the ceiling of (a / b)
			//
			// credit to Anonymous0726 for figuring this out!
			let keyLen = parseInt((length - 1) / blockLen) + 1;

			// Grailsort is hoping to find `2 * sqrt(n)` unique items
			// throughout the array
			const idealKeys = keyLen + blockLen;
            
			// TODO: Clean up `start +` offsets
			const keysFound = yield* this.grailCollectKeys(array, start, length, idealKeys);
            
			let idealBuffer;
			if(keysFound < idealKeys) {
				if(keysFound < 4) {
					// GRAILSORT STRATEGY 3 -- No block swaps or scrolling buffer; resort to Lazy Stable Sort
					yield* this.grailLazyStableSort(array, start, length);
					return;
				}
				else {
					// GRAILSORT STRATEGY 2 -- Block swaps with small scrolling buffer and/or lazy merges
					keyLen = blockLen;
					blockLen = 0;
					idealBuffer = false;

					while(keyLen > keysFound) {
						keyLen = parseInt(keyLen / 2);
					}
				}
			}
			else {
				// GRAILSORT STRATEGY 1 -- Block swaps with scrolling buffer
				idealBuffer = true;
			}
            
			const bufferEnd = blockLen + keyLen;
			let bufferLen;
			if(idealBuffer) {
				bufferLen = blockLen;
			}
			else {
				bufferLen = keyLen;
			}
            
			if(idealBuffer && extBuf != null) {
				// GRAILSORT + EXTRA SPACE
				this.externalBuffer = extBuf;
				this.externalBufferLen = extBufLen;
			}
            
			yield* this.grailBuildBlocks(array, start + bufferEnd, length - bufferEnd, bufferLen);
            
			while((length - bufferEnd) > (2 * bufferLen)) {
				bufferLen *= 2;

				let currentBlockLen = blockLen;
				let scrollingBuffer = idealBuffer;

				if(!scrollingBuffer) {
					if(keyLen > 4 && (parseInt(keyLen / 8) * keyLen) >= bufferLen) {
						currentBlockLen = parseInt(keyLen / 2);
						scrollingBuffer = true;
					}
					else {
						const blockKeysSum = parseInt(bufferLen * keysFound) / 2;
						const minKeys = GrailSort.calcMinKeys(keyLen, blockKeysSum);

						currentBlockLen = parseInt(2 * bufferLen) / minKeys;
					}
				}

				this.grailCombineBlocks(array, start, start + bufferEnd, length - bufferEnd, bufferLen, currentBlockLen, scrollingBuffer);
			}
            
			yield* this.grailInsertSort(array, start, bufferEnd);
			yield* this.grailLazyMerge(array, start, bufferEnd, length - bufferEnd);
		}
	}
    
	* grailSortInPlace(array, start, length) {
		yield* this.grailCommonSort(array, start, length, null, 0);
	}
	/*
    grailSortStaticOOP(array, start, length) {
        let buffer = Array.newInstance(array[0].getClass(), GRAIL_STATIC_EXT_BUF_LEN);
        this.grailCommonSort(array, start, length, buffer, GRAIL_STATIC_EXT_BUF_LEN);
    }
    
    grailSortDynamicOOP(array, start, length) {
        let bufferLen = 1;
        while((bufferLen * bufferLen) < length) {
            bufferLen *= 2;
        }

        let buffer = Array.newInstance(array[0].getClass(), bufferLen);

        this.grailCommonSort(array, start, length, buffer, bufferLen);
    }*/
}