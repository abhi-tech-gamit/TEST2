class Transposer {
    constructor() {
        this.chords = ['A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#'];
        this.chordRegex = /\[([A-G][#b]?(m|maj|7|9|sus|dim|aug)?(\/[A-G][#b]?)?)\]/g;
    }

    transpose(content, semitones) {
        if (semitones === 0) return content;
        
        return content.replace(this.chordRegex, (match, chord) => {
            return `[${this.transposeChord(chord, semitones)}]`;
        });
    }

    transposeChord(chord, semitones) {
        // Extract the base chord (without suffixes)
        let baseChord = chord;
        let suffix = '';
        
        // Handle slash chords (e.g., "G/B")
        let slashChord = '';
        if (chord.includes('/')) {
            const parts = chord.split('/');
            baseChord = parts[0];
            slashChord = parts[1];
        }
        
        // Extract the suffix (m, 7, sus, etc.)
        for (let i = 1; i <= baseChord.length; i++) {
            const char = baseChord.charAt(i);
            if (char === '#' || char === 'b') {
                continue;
            }
            if (char.match(/[A-G]/i)) {
                break;
            }
            suffix = baseChord.substring(i);
            baseChord = baseChord.substring(0, i);
            break;
        }
        
        // Find the index of the base chord
        let index = this.chords.indexOf(baseChord);
        if (index === -1) {
            // Handle flat notation (convert to sharp)
            const flatToSharp = {
                'Ab': 'G#',
                'Bb': 'A#',
                'Cb': 'B',
                'Db': 'C#',
                'Eb': 'D#',
                'Fb': 'E',
                'Gb': 'F#'
            };
            
            if (flatToSharp[baseChord]) {
                baseChord = flatToSharp[baseChord];
                index = this.chords.indexOf(baseChord);
            }
            
            if (index === -1) return chord; // Return original if not found
        }
        
        // Calculate new index
        let newIndex = (index + semitones + this.chords.length) % this.chords.length;
        
        // Transpose the base chord
        let newBaseChord = this.chords[newIndex];
        
        // Transpose the slash chord if present
        let newSlashChord = '';
        if (slashChord) {
            let slashIndex = this.chords.indexOf(slashChord);
            if (slashIndex === -1) {
                if (flatToSharp[slashChord]) {
                    slashChord = flatToSharp[slashChord];
                    slashIndex = this.chords.indexOf(slashChord);
                }
            }
            
            if (slashIndex !== -1) {
                let newSlashIndex = (slashIndex + semitones + this.chords.length) % this.chords.length;
                newSlashChord = '/' + this.chords[newSlashIndex];
            } else {
                newSlashChord = '/' + slashChord;
            }
        }
        
        // Return the transposed chord
        return newBaseChord + suffix + newSlashChord;
    }
}