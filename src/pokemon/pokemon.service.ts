import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { InjectModel } from '@nestjs/mongoose';
import { waitForDebugger } from 'inspector';
import { isValidObjectId, Model } from 'mongoose';
import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import { Pokemon } from './entities/pokemon.entity';

@Injectable()
export class PokemonService {

  constructor(
      @InjectModel(Pokemon.name)
      private readonly pokemonModel:Model<Pokemon>


  ){}



  async create(createPokemonDto: CreatePokemonDto) {
    
    createPokemonDto.name = createPokemonDto.name.toLocaleLowerCase();
    try
    {
    const pokemon = await this.pokemonModel.create(createPokemonDto);
    return pokemon;
    }
    catch(err) {

      this.handleExceptions(err);
    }
  }

  findAll() {
    return `This action returns all pokemon`;
  }

  async findOne(id: string) {

      let pokemon : Pokemon;
      if(!isNaN(+id))
      {
          pokemon = await this.pokemonModel.findOne({ no:id});

      }
      if(isValidObjectId(id))
      {
        pokemon = await this.pokemonModel.findById(id);
      }
      if(!pokemon)
      {
        pokemon = await this.pokemonModel.findOne({ name:id.toLocaleLowerCase().trim()});

      }

      if(!pokemon) throw new NotFoundException('Pokemon no encontrado');

      return pokemon;

}

  async update(term: string, updatePokemonDto: UpdatePokemonDto) {

      const pokemon = await this.findOne(term);
      
      if(updatePokemonDto.name)
        updatePokemonDto.name = updatePokemonDto.name.toLocaleLowerCase();
      try
      {
       await pokemon.updateOne(updatePokemonDto, { new: true });
       return {...pokemon.toJSON(), ...updatePokemonDto};

      }
      catch(err)
      {
         this.handleExceptions(err);

      }

       
  }

 async remove(_id: string) {
      //const pokemon = await this.findOne(term);

      const { deletedCount } = await this.pokemonModel.deleteOne({ _id });
      if(deletedCount === 0)
      throw new BadRequestException(`Pokemon with id ${ _id} not found`);
      return;

    
  }

  private handleExceptions(error: any)
  {
    if(error.code === 11000)
    {
      throw new BadRequestException('pokemon existe en la base de datos ')
    }
    else
    {
    console.log(error);
    }
  }


}
