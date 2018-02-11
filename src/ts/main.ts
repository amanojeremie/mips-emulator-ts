import { mips } from './mips';
import { masm } from './masm';

declare global {
	interface Window {
		asm: () => void;
		clearOutput: () => void;
		cpu: mips;
	}
}

const defaultCode = '' +
'addi $s0, $zero, 808\n' +
'addi $t0, $zero, 404\n' +
'sw $s0, ($t0)\n' +
'lw $a0, ($t0)\n' +
'addi $v0, $zero, 1\n' +
'syscall\n' +
'addi $v0, $zero, 10\n' +
'syscall';

document.addEventListener('DOMContentLoaded', (e: Event) => {
	(<HTMLInputElement> document.getElementById('asm')).value = localStorage.getItem('code') || defaultCode;
});

window.asm = () => {
	let code = (<HTMLInputElement> document.getElementById('asm')).value;
	localStorage.setItem('code', code);
	window.cpu = new mips(1024, (text: string) => {
		(<HTMLInputElement> document.getElementById('stdout')).value += text + '\n';
	}, () => {return prompt('stdin');}, (text: string) => {
		(<HTMLInputElement> document.getElementById('stderr')).value += text + '\n';
	});
	window.cpu.load(masm(code));
	window.cpu.stepAll();
	window.cpu.display();
}

window.clearOutput = () => {
	(<HTMLInputElement> document.getElementById('stdout')).value = '';
	(<HTMLInputElement> document.getElementById('stderr')).value = '';
}
