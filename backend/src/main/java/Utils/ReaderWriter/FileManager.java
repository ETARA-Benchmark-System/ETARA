package Utils.ReaderWriter;

import java.io.File;

public class FileManager {
    // Java program to delete a directory

    // function to delete subdirectories and files
    public static boolean deleteDirectory(File file) {
        // store all the paths of files and folders present
        // inside directory
        for (File subfile : file.listFiles()) {

            // if it is a subfolder,e.g Rohan and Ritik,
            // recursiley call function to empty subfolder
            if (subfile.isDirectory()) {
                if (!deleteDirectory(subfile)) {
                    System.out.println("Unable to delete " + subfile.getPath());
                    return false;
                }
            }

            // delete files and empty subfolders
            if (!subfile.delete()) {
                System.out.println("Unable to delete " + subfile.getPath());
                return false;
            }
        }
        return true;
    }

}
