

var BadChars = "`~!@^*()_={[}]\\|:;\"',<>/?";

var TableAcrossWord, TableDownWord;
var CurrentWord, PrevWordHorizontal, x, y, i, j;
var CrosswordFinished, Initialized;

// cek browser
if (document.getElementById("waitmessage") != null)
{
    document.getElementById("waitmessage").innerHTML = "Memproses Teka Teki Silang";
    
    // variabel game saat ini
    CurrentWord = -1;
    PrevWordHorizontal = false;
    
    // membuat array dari cell-ke-kata
    TableAcrossWord = new Array(CrosswordWidth);
    for (var x = 0; x < CrosswordWidth; x++) TableAcrossWord[x] = new Array(CrosswordHeight);
        TableDownWord = new Array(CrosswordWidth);
    for (var x = 0; x < CrosswordWidth; x++) TableDownWord[x] = new Array(CrosswordHeight);
        for (var y = 0; y < CrosswordHeight; y++)
            for (var x = 0; x < CrosswordWidth; x++)
            {
                TableAcrossWord[x][y] = -1;
                TableDownWord[x][y] = -1;
            }

    // masukan kata horizontal ke puzzle.
    for (var i = 0; i <= LastHorizontalWord; i++)
    {
        x = WordX[i];
        y = WordY[i];
        for (var j = 0; j < WordLength[i]; j++)
        {
            TableAcrossWord[x + j][y] = i;
        }
    }
    
    // masukan kata vertikal ke puzzle
    for (var i = LastHorizontalWord + 1; i < Words; i++)
    {
        x = WordX[i];
        y = WordY[i];
        for (var j = 0; j < WordLength[i]; j++)
        {
            TableDownWord[x][y + j] = i;
        }
    }
    
    // masukin tabel TTS
    document.writeln("<table id=\"crossword\" cellpadding=\"0\" cellspacing=\"0\" style=\"display: none; border-collapse: collapse;\">");
    for (var y = 0; y < CrosswordHeight; y++)
    {
        document.writeln("<tr>");
        for (var x = 0; x < CrosswordWidth; x++)
        {
            if (TableAcrossWord[x][y] >= 0 || TableDownWord[x][y] >= 0)
                document.write("<td id=\"c" + PadNumber(x) + PadNumber(y) + "\" class=\"box boxnormal_unsel\" onclick=\"SelectThisWord(event);\">&nbsp;</td>");
            else
                document.write("<td><\/td>");
        }
        document.writeln("<\/tr>");
    }
    document.writeln("<\/table>");
    
    // menampilkan TTS dan menyembunyikan wait message
    Initialized = true;
    document.getElementById("waitmessage").style.display = "none";
    document.getElementById("crossword").style.display = "block";
}

// * * * * * * * * * *
// Event handlers

// mengambil data ketika tombol ditekan di kotak entri kata.
function WordEntryKeyPress(event)
{
    if (CrosswordFinished) return;
    // ketika menekan tombol enter 
    if (CurrentWord >= 0 && event.keyCode == 13) OKClick();
}

// * * * * * * * * * *
// Helper functions

// memulai tts
function BeginCrossword()
{
    if (Initialized)
    {
        document.getElementById("welcomemessage").style.display = "";
        document.getElementById("checkbutton").style.display = "";
    }
}

// Mengembalikan nilai true jika string yang dilewati berisi karakter apa pun yang cenderung jahat.
function ContainsBadChars(theirWord)
{
    for (var i = 0; i < theirWord.length; i++)
        if (BadChars.indexOf(theirWord.charAt(i)) >= 0) return true;
    return false;
}

// Pads angka keluar menjadi tiga karakter.
function PadNumber(number)
{
    if (number < 10)
        return "00" + number;
    else if (number < 100)
        return "0" + number;
    else
        return "" +  number;
}

// Mengembalikan sel tabel pada pasangan koordinat tertentu.
function CellAt(x, y)
{
    return document.getElementById("c" + PadNumber(x) + PadNumber(y));
}

// Batalkan pemilihan kata saat ini, jika ada kata yang dipilih. TIDAK mengubah nilai CurrentWord.
function DeselectCurrentWord()
{
    if (CurrentWord < 0) return;
    var x, y, i;
    
    document.getElementById("answerbox").style.display = "none";
    ChangeCurrentWordSelectedStyle(false);
    CurrentWord = -1;
    
}

// Mengubah gaya sel dalam kata saat ini.
function ChangeWordStyle(WordNumber, NewStyle)
{
    if (WordNumber< 0) return;
    var x = WordX[WordNumber];
    var y = WordY[WordNumber];
    
    if (WordNumber<= LastHorizontalWord)
        for (i = 0; i < WordLength[WordNumber]; i++)
            CellAt(x + i, y).className = NewStyle;
        else
            for (i = 0; i < WordLength[WordNumber]; i++)
                CellAt(x, y + i).className = NewStyle;
        }

// Mengubah gaya sel dalam kata saat ini antara bentuk yang dipilih / tidak dipilih.
function ChangeCurrentWordSelectedStyle(IsSelected)
{
    if (CurrentWord < 0) return;
    var x = WordX[CurrentWord];
    var y = WordY[CurrentWord];
    
    if (CurrentWord <= LastHorizontalWord)
        for (i = 0; i < WordLength[CurrentWord]; i++)
            CellAt(x + i, y).className = CellAt(x + i, y).className.replace(IsSelected ? "_unsel" : "_sel", IsSelected ? "_sel" : "_unsel");
        else
            for (i = 0; i < WordLength[CurrentWord]; i++)
                CellAt(x, y + i).className = CellAt(x, y + i).className.replace(IsSelected ? "_unsel" : "_sel", IsSelected ? "_sel" : "_unsel");
        }

// Memilih kata baru dengan menguraikan nama elemen TD yang dirujuk oleh
// event objek, dan kemudian menerapkan gaya yang diperlukan.
function SelectThisWord(event)
{
    if (CrosswordFinished) return;
    var x, y, i, TheirWord, TableCell;
    
    // Hapus pilihan kata sebelumnya jika ada yang dipilih.
    document.getElementById("welcomemessage").style.display = "none";
    if (CurrentWord >= 0) OKClick();
    DeselectCurrentWord();
    
    // menentukan koordinat sel yang diklik, lalu kata itu yang diklik.
    var target = (event.srcElement ? event.srcElement: event.target);
    x = parseInt(target.id.substring(1, 4), 10);
    y = parseInt(target.id.substring(4, 7), 10);
    
    // Jika mereka mengklik persimpangan, pilih jenis kata yang TIDAK dipilih terakhir kali.
    if (TableAcrossWord[x][y] >= 0 && TableDownWord[x][y] >= 0)
        CurrentWord = PrevWordHorizontal ? TableDownWord[x][y] : TableAcrossWord[x][y];
    else if (TableAcrossWord[x][y] >= 0)
        CurrentWord = TableAcrossWord[x][y];
    else if (TableDownWord[x][y] >= 0)
        CurrentWord = TableDownWord[x][y];

    PrevWordHorizontal = (CurrentWord <= LastHorizontalWord);
    
    // Sekarang, ubah gaya sel dalam kata ini.
    ChangeCurrentWordSelectedStyle(true);
    
    // Lalu, siapkan kotak jawaban.
    x = WordX[CurrentWord];
    y = WordY[CurrentWord];
    TheirWord = "";
    var TheirWordLength = 0;
    for (i = 0; i < WordLength[CurrentWord]; i++)
    {
        // Temukan sel tabel yang sesuai.
        if (CurrentWord <= LastHorizontalWord)
            TableCell = CellAt(x + i, y);
        else
            TableCell = CellAt(x, y + i);
        // Tambahkan isinya ke kata yang sedang kita bangun.
        if (TableCell.innerHTML != null && TableCell.innerHTML.length > 0 && TableCell.innerHTML != " " && TableCell.innerHTML.toLowerCase() != "&nbsp;")
        {
            TheirWord += TableCell.innerHTML.toUpperCase();
            TheirWordLength++;
        }
        else
        {
            TheirWord += "&bull;";
        }
    }
    
    document.getElementById("wordlabel").innerHTML = TheirWord;
    document.getElementById("wordinfo").innerHTML = ((CurrentWord <= LastHorizontalWord) ? "Across, " : "Down, ") + WordLength[CurrentWord] + " letters.";
    document.getElementById("wordclue").innerHTML = Clue[CurrentWord];
    document.getElementById("worderror").style.display = "none";
    document.getElementById("cheatbutton").style.display = (Word.length == 0) ? "none" : "";
    if (TheirWordLength == WordLength[CurrentWord])
        document.getElementById("wordentry").value = TheirWord.replace(/&AMP;/g, '&');
    else
        document.getElementById("wordentry").value = "";
    
    // memunculkan kotak jawaban
    document.getElementById("answerbox").style.display = "block";
    try
    {
        document.getElementById("wordentry").focus();
        document.getElementById("wordentry").select();
    }
    catch (e)
    {
    }
    
}

// ketika klik tombol ok
function OKClick()
{
    var TheirWord, x, y, i, TableCell;
    if (CrosswordFinished) return;
    if (document.getElementById("okbutton").disabled) return;
    
    // memvalidasi data yang diinput
    TheirWord = document.getElementById("wordentry").value.toUpperCase();
    if (TheirWord.length == 0)
    {
        DeselectCurrentWord();
        return;
    }
    if (ContainsBadChars(TheirWord))
    {
        document.getElementById("worderror").innerHTML = "The word that you typed contains invalid characters.  Please type only letters in the box above.";
        document.getElementById("worderror").style.display = "block";
        return;
    }
    if (TheirWord.length < WordLength[CurrentWord])
    {
        document.getElementById("worderror").innerHTML  = "You did not type enough letters.  This word has " + WordLength[CurrentWord] + " letters.";
        document.getElementById("worderror").style.display = "block";
        return;
    }
    if (TheirWord.length > WordLength[CurrentWord])
    {
        document.getElementById("worderror").innerHTML = "You typed too many letters.  This word has " + WordLength[CurrentWord] + " letters.";
        document.getElementById("worderror").style.display = "block";
        return;
    }
    
    // Jika kita sampai sejauh ini, mereka mengetik kata yang dapat diterima, jadi tambahkan huruf-huruf ini ke dalam teka-teki dan sembunyikan kotak entri.
    x = WordX[CurrentWord];
    y = WordY[CurrentWord];
    for (i = 0; i < TheirWord.length; i++)
    {
        TableCell = CellAt(x + (CurrentWord <= LastHorizontalWord ? i : 0), y + (CurrentWord > LastHorizontalWord ? i : 0));
        TableCell.innerHTML = TheirWord.substring(i, i + 1);
    }
    DeselectCurrentWord();
}

// ketika klik tombol check puzzle
function CheckClick()
{
    var i, j, x, y, UserEntry, ErrorsFound = 0, EmptyFound = 0, TableCell;
    if (CrosswordFinished) return;
    DeselectCurrentWord();
    
    for (y = 0; y < CrosswordHeight; y++)
        for (x = 0; x < CrosswordWidth; x++)
            if (TableAcrossWord[x][y] >= 0 || TableDownWord[x][y] >= 0)
            {
                TableCell = CellAt(x, y);
                if (TableCell.className == "box boxerror_unsel") TableCell.className = "box boxnormal_unsel";
            }

            for (i = 0; i < Words; i++)
            {
        // mengambil inputan untuk kata ini
        UserEntry = "";
        for (j = 0; j < WordLength[i]; j++)
        {
            if (i <= LastHorizontalWord)
                TableCell = CellAt(WordX[i] + j, WordY[i]);
            else
                TableCell = CellAt(WordX[i], WordY[i] + j);
            if (TableCell.innerHTML.length > 0 && TableCell.innerHTML.toLowerCase() != "&nbsp;")
            {
                UserEntry += TableCell.innerHTML.toUpperCase();
            }
            else
            {
                UserEntry = "";
                EmptyFound++;
                break;
            }
        }
        UserEntry = UserEntry.replace(/&AMP;/g, '&');
        // Jika kata ini tidak cocok, maka akan jadi error.
        if (HashWord(UserEntry) != AnswerHash[i] && UserEntry.length > 0)
        {
            ErrorsFound++;
            ChangeWordStyle(i, "box boxerror_unsel");
        }
    }
    
    // Jika hanya dapat memeriksa sekali, nonaktifkan semuanya sebelum waktunya.
    if ( OnlyCheckOnce )
    {
        CrosswordFinished = true;
        document.getElementById("checkbutton").style.display = "none";
    }
    
    // Jika ditemukan kesalahan, keluar .
    if (ErrorsFound > 0 && EmptyFound > 0)
        document.getElementById("welcomemessage").innerHTML = ErrorsFound + (ErrorsFound > 1 ? " errors" : " error") + " and " + EmptyFound + (EmptyFound > 1 ? " incomplete words were" : " incomplete word was") + " found.";
    else if (ErrorsFound > 0)
        document.getElementById("welcomemessage").innerHTML = ErrorsFound + (ErrorsFound > 1 ? " errors were" : " error was") + " found.";
    else if (EmptyFound > 0)
        document.getElementById("welcomemessage").innerHTML = "No errors were found, but " + EmptyFound + (EmptyFound > 1 ? " incomplete words were" : " incomplete word was") + " found.";
    
    if (ErrorsFound + EmptyFound > 0)
    {
        document.getElementById("welcomemessage").style.display = "";
        return;
    }

    // menyelesaikan puzzle
    CrosswordFinished = true;
    document.getElementById("checkbutton").style.display = "none";
    document.getElementById("congratulations").style.display = "block";
    document.getElementById("welcomemessage").style.display = "none";
}

// ketika klik tombol solved
function CheatClick()
{
    if (CrosswordFinished) return;
    var OldWord = CurrentWord;
    document.getElementById("wordentry").value = Word[CurrentWord];
    OKClick();
    ChangeWordStyle(OldWord, "box boxcheated_unsel");
}

// Mengembalikan hash satu arah untuk sebuah kata.
function HashWord(Word)
{
    var x = (Word.charCodeAt(0) * 719) % 1138;
    var Hash = 837;
    var i;
    for (i = 1; i <= Word.length; i++)
        Hash = (Hash * i + 5 + (Word.charCodeAt(i - 1) - 64) * x) % 98503;
    return Hash;
}