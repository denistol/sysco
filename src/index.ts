import { load as loadSysco } from "./sysco";
import { load as loadGrainger } from "./grainger";

const main = async () => {
    
    const [, , ...args] = process.argv;
    const command = args[0];
    const rest = args.slice(1);

    if (command === 'sysco') {
        await loadSysco()
    } else if (command === 'grainger') {
        await loadGrainger()
    } else {
        console.log('❓ Invalid argument', command);
    }
}

main()