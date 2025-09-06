
import java.sql.Connection;
import java.sql.DriverManager;
import javax.swing.JOptionPane;

/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */

/**
 *
 * @author ameyp
 */
public class dbConnection {
     public static Connection con(){
        Connection con=null;
    try{
       Class.forName("com.mysql.jdbc.Driver");
       con=DriverManager.getConnection("jdbc:mysql://localhost:3306/bill2","root","");
  

    
    }catch(Exception e){
        JOptionPane.showMessageDialog(null, e);

    }
    return con;
    }
    
    
}
