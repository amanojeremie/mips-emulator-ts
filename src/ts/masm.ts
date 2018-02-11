const insShift = 26;
const rsShift = 21;
const rtShift = 16;
const rdShift = 11;
const shmShift = 6;

const opcodeDictionary: { [register: string]: (tokens: string[]) => number } = {
	'noop': (tokens: string[]) => {return 0},
	'sll': (tokens: string[]) => {
		let rt = registerDictionary[tokens[2]] << rtShift;
		let rd = registerDictionary[tokens[1]] << rdShift;
		let shm = (Number(tokens[3]) & 0x1F) << shmShift;
		return 0x00000000 | rt | rd | shm;
	},
	'srl': (tokens: string[]) => {
		let rt = registerDictionary[tokens[2]] << rtShift;
		let rd = registerDictionary[tokens[1]] << rdShift;
		let shm = (Number(tokens[3]) & 0x1F) << shmShift;
		return 0x00000002 | rt | rd | shm;
	},
	'sra': (tokens: string[]) => {
		let rt = registerDictionary[tokens[2]] << rtShift;
		let rd = registerDictionary[tokens[1]] << rdShift;
		let shm = (Number(tokens[3]) & 0x1F) << shmShift;
		return 0x00000003 | rt | rd | shm;
	},
	'sllv': (tokens: string[]) => {
		let rs = registerDictionary[tokens[3]] << rsShift;
		let rt = registerDictionary[tokens[2]] << rtShift;
		let rd = registerDictionary[tokens[1]] << rdShift;
		return 0x0000004 | rs | rt | rd;
	},
	'srlv': (tokens: string[]) => {
		let rs = registerDictionary[tokens[3]] << rsShift;
		let rt = registerDictionary[tokens[2]] << rtShift;
		let rd = registerDictionary[tokens[1]] << rdShift;
		return 0x0000006 | rs | rt | rd;
	},
	'srav': (tokens: string[]) => {
		let rs = registerDictionary[tokens[3]] << rsShift;
		let rt = registerDictionary[tokens[2]] << rtShift;
		let rd = registerDictionary[tokens[1]] << rdShift;
		return 0x0000007 | rs | rt | rd;
	},
	'syscall': (tokens: string[]) => {
		return 0x0000000C;
	},
	'add': (tokens: string[]) => {
		let rs = registerDictionary[tokens[1]] << rsShift;
		let rt = registerDictionary[tokens[2]] << rtShift;
		let rd = registerDictionary[tokens[3]] << rdShift;
		return 0x00000020 | rs | rt | rd;
	},
	'addi': (tokens: string[]) => {
		let rs = registerDictionary[tokens[1]] << rsShift;
		let rt = registerDictionary[tokens[2]] << rtShift;
		let imm = Number(tokens[3]) & 0xFFFF;
		return 0x20000000 | rs | rt | imm;
	},
	'addiu': (tokens: string[]) => {
		let rs = registerDictionary[tokens[1]] << rsShift;
		let rt = registerDictionary[tokens[2]] << rtShift;
		let imm = Number(tokens[3]) & 0xFFFF;
		return 0x24000000 | rs | rt | imm;
	},
	'addu': (tokens: string[]) => {
		let rs = registerDictionary[tokens[1]] << rsShift;
		let rt = registerDictionary[tokens[2]] << rtShift;
		let rd = registerDictionary[tokens[3]] << rdShift;
		return 0x00000021 | rs | rt | rd;
	},
	'sub': (tokens: string[]) => {
		let rs = registerDictionary[tokens[1]] << rsShift;
		let rt = registerDictionary[tokens[2]] << rtShift;
		let rd = registerDictionary[tokens[3]] << rdShift;
		return 0x00000022 | rs | rt | rd;
	},
	'subu': (tokens: string[]) => {
		let rs = registerDictionary[tokens[1]] << rsShift;
		let rt = registerDictionary[tokens[2]] << rtShift;
		let rd = registerDictionary[tokens[3]] << rdShift;
		return 0x00000023 | rs | rt | rd;
	},
	'and': (tokens: string[]) => {
		let rs = registerDictionary[tokens[1]] << rsShift;
		let rt = registerDictionary[tokens[2]] << rtShift;
		let rd = registerDictionary[tokens[3]] << rdShift;
		return 0x00000024 | rs | rt | rd;
	},
	'or': (tokens: string[]) => {
		let rs = registerDictionary[tokens[1]] << rsShift;
		let rt = registerDictionary[tokens[2]] << rtShift;
		let rd = registerDictionary[tokens[3]] << rdShift;
		return 0x00000025 | rs | rt | rd;
	},
	'xor': (tokens: string[]) => {
		let rs = registerDictionary[tokens[1]] << rsShift;
		let rt = registerDictionary[tokens[2]] << rtShift;
		let rd = registerDictionary[tokens[3]] << rdShift;
		return 0x00000026 | rs | rt | rd;
	},
	'andi': (tokens: string[]) => {
		let rs = registerDictionary[tokens[2]] << rsShift;
		let rt = registerDictionary[tokens[1]] << rtShift;
		let imm = Number(tokens[3]) & 0xFFFF;
		return 0x30000000 | rs | rt | imm;
	},
	'ori': (tokens: string[]) => {
		let rs = registerDictionary[tokens[2]] << rsShift;
		let rt = registerDictionary[tokens[1]] << rtShift;
		let imm = Number(tokens[3]) & 0xFFFF;
		return 0x34000000 | rs | rt | imm;
	},
	'xori': (tokens: string[]) => {
		let rs = registerDictionary[tokens[2]] << rsShift;
		let rt = registerDictionary[tokens[1]] << rtShift;
		let imm = Number(tokens[3]) & 0xFFFF;
		return 0x38000000 | rs | rt | imm;
	},
	'lw': (tokens: string[]) => {
		let memory = tokens[2].split('(');
		let rs = memory.length == 1 ? registerDictionary[memory[0].substr(0, memory[0].indexOf(')'))] << rsShift
			: registerDictionary[memory[1].substr(0, memory[1].indexOf(')'))] << rsShift;
		let rt = registerDictionary[tokens[1]] << rtShift;
		let imm = memory.length == 1 ? 0 : Number(memory[0]) & 0xFFFF;
		return 0x8C000000 | rs | rt | imm;
	},
	'sw': (tokens: string[]) => {
		let memory = tokens[2].split('(');
		let rs = memory.length == 1 ? registerDictionary[memory[0].substr(0, memory[0].indexOf(')'))] << rsShift
			: registerDictionary[memory[1].substr(0, memory[1].indexOf(')'))] << rsShift;
		let rt = registerDictionary[tokens[1]] << rtShift;
		let imm = memory.length == 1 ? 0 : Number(memory[0]) & 0xFFFF;
		return 0xAC000000 | rs | rt | imm;
	}
}

const registerDictionary: { [register: string]: number } = {
	'$zero': 0x00,
	'$at': 0x01,
	'$v0': 0x02,
	'$v1': 0x03,
	'$a0': 0x04,
	'$a1': 0x05,
	'$a2': 0x06,
	'$a3': 0x07,
	'$t0': 0x08,
	'$t1': 0x09,
	'$t2': 0x0A,
	'$t3': 0x0B,
	'$t4': 0x0C,
	'$t5': 0x0D,
	'$t6': 0x0E,
	'$t7': 0x0F,
	'$s0': 0x10,
	'$s1': 0x11,
	'$s2': 0x12,
	'$s3': 0x13,
	'$s4': 0x14,
	'$s5': 0x15,
	'$s6': 0x16,
	'$s7': 0x17,
	'$t8': 0x18,
	'$t9': 0x19
}

export function masm(asm : string) : number[] {
	let lines = asm.split('\n');
	let code = [];
	for(let i = 0; i < lines.length; i++) {
		if(lines[i].trim().length > 0) {
			code.push(assemble(lines[i].trim()));
		}
	}
	return code;
}

function assemble(instruction: string) : number {
	let tokens = instruction.split(/[, ]+/);
	let instructionCode = opcodeDictionary[tokens[0]](tokens);
	return opcodeDictionary[tokens[0].toLowerCase()](tokens);
}