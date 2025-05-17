<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Historique extends Model
{
    use HasFactory;
    public $timestamps = false;

    protected $table = 'historique';
    protected $primaryKey = 'hist_id';

    protected $fillable = [
        'description',
        'change_date',
        'dochistorique_path',
        'task_id',
    ];

    public function task()
    {
        return $this->belongsTo(Task::class, 'task_id', 'task_id');
    }

    public function documentpaths()
    {
        return $this->hasMany(Documentpath::class, 'hist_id', 'hist_id');
    }
}
