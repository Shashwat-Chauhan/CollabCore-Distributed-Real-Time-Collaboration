import db from '../config/database,js'

class DocumentRepository{
    async create ({id , title , buffer}){
        const result = await db.query(
            `INSERT INTO docs(id , title , doc , version)
            VALUES ($1 , $2 , $3 , 1)
            RETURNING *`,
            [id , title , buffer]
        );
        return result.rows[0];
    }


    async findById(id){
        const result = await db.query(
            `SELECT * FROM docs WHERE id = $1`,
            [id]
        );
        return result.rows[0] || null;
    }


    async update(id , buffer , version){
        const result = await db.query(
            `UPDATE docs
            SET doc=$1 , version = $2 , update_at = now()
            WHERE id = $3
            RETURNING *`,
            [buffer , version , id]
        );
        return result.rows[0];
    }
}


export default new DocumentRepository();