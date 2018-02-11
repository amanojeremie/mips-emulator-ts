const linkReg = 31;
const vReg = 2;
const aReg = 4;
const insShift = 26;
const rsShift = 21;
const rtShift = 16;
const rdShift = 11;
const shmShift = 6;
const immMask = ((1 << 16) - 1);
const immSignMask = (1 << 15);
const signBitMask = (1 << 31);
const rsMask = ((1 << 5) - 1) << rsShift
const rtMask = ((1 << 5) - 1) << rtShift;
const rdMask = ((1 << 5) - 1) << rdShift;
const shmMask = ((1 << 5) - 1) << shmShift;
const funMask = ((1 << 6) - 1);
const adrMask = ((1 << 26) - 1);

export class mips {
	private programSize: number;
	private pc: number;
	private memory: number[];
	private registers: number[];
	private exitStatus: boolean;
	private stdOut: (out: any) => void;
	private stdIn: () => any;
	private stdErr: (err: any) => void;

	constructor(programSize: number,
		stdOut: (out:any) => void,
		stdIn: () => any,
		stdErr: (err: any) => void) {
		this.programSize = programSize;
		this.pc = 0;
		this.memory = [];
		this.registers = [];
		for(let i = 0; i < 32; i++) {
			this.registers.push(0);
		}
		this.exitStatus = false;
		this.stdOut = stdOut;
		this.stdIn = stdIn;
		this.stdErr = stdErr;
	}

	public get programCounter(): number {
		return this.pc;
	}

	public register(regNum: number): number {
		return this.registers[regNum];
	}
	
	public load(toLoad: number[]) {
		this.memory = toLoad;
	}

	public step() {
		if(!this.exitStatus && this.pc < this.programSize) {
			this.registers[0] = 0;
			this.execute(this.memory[this.pc]);
		}
	}

	public stepAll() {
		while(!this.exitStatus && this.pc < this.programSize) {
			this.registers[0] = 0;
			this.execute(this.memory[this.pc]);
		}
	}

	public display() {
		this.stdOut('pc:' + this.pc);
		for(let i = 0; i < 32; i++) {
			this.stdOut('r' + i + ': ' + this.registers[i])
		}
	}

	private execute(instruction: number) {
		instruction &= 0xFFFFFFFF;;
		let opcode = instruction >>> insShift & 0xFF;
		switch(opcode) {
			case 0x00: {
				let rs = (instruction & rsMask) >> rsShift & 0x1F;
				let rt = (instruction & rtMask) >> rtShift & 0x1F;
				let rd = (instruction & rdMask) >> rdShift & 0x1F;
				let shm = (instruction & shmMask) >> shmShift & 0xFF;
				let fun = instruction & funMask & 0xFF;
				this.r(opcode, rs, rt, rd, shm, fun);
				break;
			}
			case 0x02: { //J
				let adr = (instruction & adrMask) >>> 0;
				this.pc = (this.pc & 0xF0000000) | adr;
				break;
			}
			case 0x03: { //JAL
				this.registers[linkReg] = this.pc + 1;
				let adr = (instruction & adrMask) >>> 0;
				this.pc = (this.pc & 0xF0000000) | adr;
				break;
			}
			case 0x08: { //ADDI
				let rs = (instruction & rsMask) >> rsShift & 0x1F;
				let rt = (instruction & rtMask) >> rtShift & 0x1F;
				let imm = instruction & immMask;
				imm = (imm & immSignMask) ? -(~imm & 0xFFFF) - 1 : imm;
				this.registers[rs] = this.registers[rt] + imm & 0xFFFFFFFF;
				this.pc++;
				break;
			}
			case 0x09: { //ADDIU
				let rs = (instruction & rsMask) >> rsShift & 0x1F;
				let rt = (instruction & rtMask) >> rtShift & 0x1F;
				let imm = (instruction & immMask) >>> 0;
				this.registers[rs] = ((this.registers[rt] >>> 0) + imm & 0xFFFFFFFF) >>> 0;
				this.pc++;
				break;
			}
			case 0x0C: { //ANDI
				let rs = (instruction & rsMask) >> rsShift & 0x1F;
				let rt = (instruction & rtMask) >> rtShift & 0x1F;
				let imm = (instruction & immMask);
				this.registers[rt] = this.registers[rs] & imm;
				this.pc++;
				break;
			}
			case 0x0D: { //ORI
				let rs = (instruction & rsMask) >> rsShift & 0x1F;
				let rt = (instruction & rtMask) >> rtShift & 0x1F;
				let imm = (instruction & immMask);
				this.registers[rt] = this.registers[rs] | imm;
				this.pc++;
				break;
			}
			case 0x0E: { //XORI
				let rs = (instruction & rsMask) >> rsShift & 0x1F;
				let rt = (instruction & rtMask) >> rtShift & 0x1F;
				let imm = (instruction & immMask);
				this.registers[rt] = this.registers[rs] ^ imm;
				this.pc++;
				break;
			}
			case 0x23: { //LW
				let rs = (instruction & rsMask) >> rsShift & 0x1F;
				let rt = (instruction & rtMask) >> rtShift & 0x1F;
				let imm = (instruction & immMask) >>> 0;
				this.registers[rt] = this.memory[(this.registers[rs] / 4) + Math.floor(imm / 4)];
				this.pc++;
				break;
			}
			case 0x2B: { //SW
				let rs = (instruction & rsMask) >> rsShift & 0x1F;
				let rt = (instruction & rtMask) >> rtShift & 0x1F;
				let imm = (instruction & immMask) >>> 0;
				this.memory[Math.floor(this.registers[rs] / 4) + Math.floor(imm / 4)] = this.registers[rt];
				this.pc++;
				break;		
			}
			default: {
				this.stdErr('Invalid or Unsupported OpCode:' + opcode.toString(16) + ' Line:' + this.pc + 1);
				this.pc++;
				break;
			}
		}
	}

	private r(opcode: number, rs: number, rt: number, rd: number, shm: number, fun: number) {
		switch(fun) {
			case 0x00: { //SLL
				this.registers[rd] = this.registers[rt] << shm & 0xFFFFFFFF;
				this.pc++;
				break;
			}
			case 0x02: { //SRL
				this.registers[rd] = this.registers[rt] >>> shm & 0xFFFFFFFF;
				this.pc++;
				break;
			}
			case 0x03: { //SRA
				this.registers[rd] = this.registers[rt] >> shm & 0xFFFFFFFF;
				this.pc++;
				break;
			}
			case 0x04: { //SLLV
				this.registers[rd] = this.registers[rt] << this.registers[rs] & 0xFFFFFFFF;
				this.pc++;
				break;
			}
			case 0x06: { //SRLV
				this.registers[rd] = this.registers[rt] >>> this.registers[rs] & 0xFFFFFFFF;
				this.pc++;
				break;
			}
			case 0x07: { //SRAV
				this.registers[rd] = this.registers[rt] >> this.registers[rs] & 0xFFFFFFFF;
				this.pc++;
				break;
			}
			case 0x08: { //JR
				this.pc = this.registers[rs] >>> 0;
				break;
			}
			case 0x09: { //JALR
				this.registers[linkReg] = this.pc + 1;
				this.pc = this.registers[rs] >>> 0;
				break;
			}
			case 0x0C: { //Syscall
				switch(this.registers[vReg]) {
					case 0x00000001: {
						this.stdOut(this.registers[aReg]);
						break;
					}
					case 0x00000005: {
						this.registers[vReg] = Number(this.stdIn()) & 0xFFFFFFFF;
						break;
					}
					case 0x0000000A: {
						this.exitStatus = true;
						this.stdOut('System Exit');
						break;
					}
					default: {
						this.stdErr('Invalid or Unsupported System Call! Line:' + this.pc + 1);
						break;
					}
				}
				this.pc++;
				break;
			}
			case 0x20: { //AND
				this.registers[rs] = this.registers[rt] + this.registers[rd] & 0xFFFFFFFF;
				this.pc++;
				break;
			}
			case 0x21: { //ADDU
				this.registers[rs] = ((this.registers[rt] >>> 0) + (this.registers[rd] >>> 0) & 0xFFFFFFFF) >>> 0;
				this.pc++;
				break;
			}
			case 0x22: { //SUB
				this.registers[rs] = rt - rd;
				this.pc++;
				break;
			}
			case 0x23: { //SUBU
				this.registers[rs] = ((this.registers[rt] >>> 0) - (this.registers[rd] >>> 0) & 0xFFFFFFFF) >>> 0;
				this.pc++;
				break;
			}
			case 0x24: { //AND
				this.registers[rs] = this.registers[rt] & this.registers[rd];
				this.pc++;
				break;
			}
			case 0x25: { //OR
				this.registers[rs] = this.registers[rt] | this.registers[rd];
				this.pc++;
				break;
			}
			case 0x26: { //XOR
				this.registers[rs] = this.registers[rt] ^ this.registers[rd];
				this.pc++;
				break;
			}
			default: {
				this.stdErr('Invalid or Unsupported R-Type Line:' + this.pc + 1);
				this.pc++;
				break;
			}
		}
	}
}